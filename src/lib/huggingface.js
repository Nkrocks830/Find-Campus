/**
 * Hugging Face Inference API Integration
 * Uses free-tier models for text & image embeddings
 * 
 * Text: sentence-transformers/all-MiniLM-L6-v2 → 384-dim vectors
 * Image: openai/clip-vit-base-patch32 → used for category suggestion
 */

const HF_API_TOKEN = import.meta.env.VITE_HF_API_TOKEN
const HF_API_BASE = 'https://api-inference.huggingface.co/models'

const TEXT_EMBED_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
const ZERO_SHOT_MODEL = 'facebook/bart-large-mnli'

// ─── Core API Call ───────────────────────────────────────────────────────────

const hfFetch = async (model, payload, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${HF_API_BASE}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.status === 503) {
        // Model loading — wait and retry
        const retryAfter = parseInt(res.headers.get('Retry-After') || '20')
        await new Promise(r => setTimeout(r, Math.min(retryAfter * 1000, 30000)))
        continue
      }

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`HF API error ${res.status}: ${err}`)
      }

      return await res.json()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 2000 * (i + 1)))
    }
  }
}

// ─── Text Embeddings ─────────────────────────────────────────────────────────

/**
 * Get 384-dimensional text embedding for a string
 * @param {string} text
 * @returns {Promise<number[]>} embedding vector
 */
export const getTextEmbedding = async (text) => {
  if (!text || text.trim().length === 0) {
    return new Array(384).fill(0)
  }

  try {
    const result = await hfFetch(TEXT_EMBED_MODEL, {
      inputs: text.slice(0, 512), // Limit to 512 chars
    })

    // API returns array of arrays for batched input, or flat array for single
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0]
    }
    return result
  } catch (err) {
    console.warn('Text embedding failed, using fallback:', err.message)
    return null
  }
}

/**
 * Get text embeddings for multiple texts in one batch call
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export const getBatchTextEmbeddings = async (texts) => {
  if (!texts || texts.length === 0) return []

  try {
    const result = await hfFetch(TEXT_EMBED_MODEL, {
      inputs: texts.map(t => t.slice(0, 512)),
    })
    return result
  } catch (err) {
    console.warn('Batch embedding failed:', err.message)
    return texts.map(() => null)
  }
}

// ─── Cosine Similarity ───────────────────────────────────────────────────────

/**
 * Compute cosine similarity between two vectors
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} similarity score 0-1
 */
export const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0

  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, dot / denom))
}

// ─── Category Auto-Suggestion ─────────────────────────────────────────────────

export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: '💻', candidates: ['electronic device', 'phone', 'laptop', 'charger', 'earbuds', 'calculator'] },
  { value: 'bag', label: 'Bag / Backpack', icon: '🎒', candidates: ['bag', 'backpack', 'purse', 'satchel'] },
  { value: 'id_card', label: 'ID Card', icon: '🪪', candidates: ['identity card', 'student ID', 'college card'] },
  { value: 'bottle', label: 'Water Bottle', icon: '🍶', candidates: ['water bottle', 'flask', 'tumbler'] },
  { value: 'keys', label: 'Keys', icon: '🔑', candidates: ['keys', 'keychain', 'key ring'] },
  { value: 'wallet', label: 'Wallet', icon: '👛', candidates: ['wallet', 'purse', 'money holder'] },
  { value: 'accessories', label: 'Accessories', icon: '👓', candidates: ['glasses', 'watch', 'jewelry', 'accessory'] },
  { value: 'stationery', label: 'Stationery', icon: '📚', candidates: ['notebook', 'pen', 'book', 'stationery'] },
  { value: 'sports', label: 'Sports Equipment', icon: '🏏', candidates: ['sports equipment', 'ball', 'bat', 'racket'] },
  { value: 'clothing', label: 'Clothing', icon: '👕', candidates: ['clothing', 'shirt', 'jacket', 'sweater'] },
  { value: 'other', label: 'Other', icon: '📦', candidates: ['miscellaneous item', 'object'] },
]

/**
 * Auto-suggest item category using zero-shot classification
 * Falls back to keyword matching if API fails
 * @param {string} description - Item description
 * @returns {Promise<{category: string, confidence: number}>}
 */
export const suggestCategory = async (description) => {
  if (!description || description.trim().length < 3) {
    return { category: 'other', confidence: 0 }
  }

  // First try keyword matching (fast, no API)
  const lower = description.toLowerCase()
  for (const cat of CATEGORIES) {
    for (const kw of cat.candidates) {
      if (lower.includes(kw.toLowerCase())) {
        return { category: cat.value, confidence: 0.85, source: 'keyword' }
      }
    }
  }

  // Then try HF zero-shot classification
  try {
    const labels = CATEGORIES.map(c => c.candidates[0])
    const result = await hfFetch(ZERO_SHOT_MODEL, {
      inputs: description.slice(0, 300),
      parameters: {
        candidate_labels: labels,
      },
    })

    if (result && result.labels && result.scores) {
      const topIdx = result.scores.indexOf(Math.max(...result.scores))
      const topLabel = result.labels[topIdx]
      const matched = CATEGORIES.find(c => c.candidates[0] === topLabel)
      return {
        category: matched?.value || 'other',
        confidence: result.scores[topIdx],
        source: 'ai',
      }
    }
  } catch (err) {
    console.warn('Category suggestion API failed:', err.message)
  }

  return { category: 'other', confidence: 0 }
}

// ─── Build Item Text for Embedding ───────────────────────────────────────────

/**
 * Creates a rich text representation of an item for embedding
 * @param {object} item
 */
export const buildItemText = (item) => {
  return [
    item.title || '',
    item.description || '',
    item.category || '',
    item.location_name || '',
  ].filter(Boolean).join('. ')
}
