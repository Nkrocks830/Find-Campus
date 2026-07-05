/**
 * AI Match Orchestration
 * Computes similarity between lost & found items using text embeddings
 * and categorical/location bonuses for a weighted final score
 */

import { getTextEmbedding, cosineSimilarity, buildItemText } from './huggingface'
import { getItems, upsertMatch } from './supabase'

/**
 * Compute match score between two items
 * Weights: 70% text similarity + 20% category match + 10% location proximity
 */
export const computeMatchScore = async (itemA, itemB) => {
  // Category exact match bonus (0 or 1)
  const categoryMatch = itemA.category === itemB.category ? 1 : 0

  // Location proximity bonus
  let locationScore = 0
  if (itemA.location_name && itemB.location_name) {
    locationScore = itemA.location_name.toLowerCase() === itemB.location_name.toLowerCase() ? 1 : 0
  } else if (
    itemA.location_lat && itemA.location_lng &&
    itemB.location_lat && itemB.location_lng
  ) {
    const dist = Math.sqrt(
      Math.pow(itemA.location_lat - itemB.location_lat, 2) +
      Math.pow(itemA.location_lng - itemB.location_lng, 2)
    )
    locationScore = dist < 0.001 ? 1 : dist < 0.005 ? 0.5 : 0
  }

  // Text embedding similarity (primary signal)
  let textScore = 0
  try {
    const [embA, embB] = await Promise.all([
      getTextEmbedding(buildItemText(itemA)),
      getTextEmbedding(buildItemText(itemB)),
    ])
    if (embA && embB) {
      textScore = cosineSimilarity(embA, embB)
    }
  } catch (err) {
    console.warn('Embedding failed for match computation:', err)
    // Fall back to keyword overlap
    const wordsA = new Set(itemA.title.toLowerCase().split(/\s+/))
    const wordsB = new Set(itemB.title.toLowerCase().split(/\s+/))
    const intersection = [...wordsA].filter(w => wordsB.has(w) && w.length > 3)
    textScore = intersection.length / Math.max(wordsA.size, wordsB.size, 1)
  }

  // Weighted total score
  const total = (textScore * 0.70) + (categoryMatch * 0.20) + (locationScore * 0.10)

  return {
    text: textScore,
    category: categoryMatch,
    location: locationScore,
    total: Math.min(total, 1.0),
  }
}

/**
 * Find all matches for a newly posted item
 * Compares against all opposite-type active items
 * Stores results in matches table
 *
 * @param {object} newItem - The newly created item
 * @returns {Promise<Array>} sorted matches with scores
 */
export const findMatchesForItem = async (newItem) => {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost'

  // Fetch candidate items of opposite type
  const candidates = await getItems({
    type: oppositeType,
    status: 'active',
    limit: 100,
  })

  if (!candidates || candidates.length === 0) return []

  // Compute scores in parallel (batched to avoid rate limiting)
  const BATCH_SIZE = 5
  const results = []

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE)
    const scores = await Promise.all(
      batch.map(candidate => computeMatchScore(newItem, candidate))
    )

    for (let j = 0; j < batch.length; j++) {
      const candidate = batch[j]
      const score = scores[j]

      // Only store meaningful matches (> 15% similarity)
      if (score.total > 0.15) {
        const lostId = newItem.type === 'lost' ? newItem.id : candidate.id
        const foundId = newItem.type === 'found' ? newItem.id : candidate.id

        try {
          await upsertMatch(lostId, foundId, {
            text: score.text,
            image: 0,
            total: score.total,
          })
        } catch (err) {
          console.warn('Failed to upsert match:', err)
        }

        results.push({ item: candidate, score })
      }
    }

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < candidates.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  // Sort by total score descending
  return results.sort((a, b) => b.score.total - a.score.total)
}

/**
 * Format match score as percentage string
 */
export const formatMatchPercent = (score) => {
  return `${Math.round(score * 100)}%`
}

/**
 * Get match quality label
 */
export const getMatchLabel = (score) => {
  if (score >= 0.80) return { label: 'Excellent Match', color: 'text-emerald-400' }
  if (score >= 0.60) return { label: 'Good Match', color: 'text-amber-400' }
  if (score >= 0.35) return { label: 'Possible Match', color: 'text-blue-400' }
  return { label: 'Weak Match', color: 'text-slate-400' }
}

/**
 * Generate a unique QR token for a claim handover
 */
export const generateQRToken = (claimId, itemId) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `FINDIT-${itemId.substring(0, 8).toUpperCase()}-${random}-${timestamp}`
}

/**
 * Alias: compute matches for a new item and store them.
 * Called from ReportItem after a successful item creation.
 * Non-fatal — errors are swallowed so they don't break the UI flow.
 *
 * @param {object} item      - The newly created item object
 * @param {number[]} embedding - Pre-computed text embedding (unused here, kept for API compat)
 */
export const computeAndStoreMatches = async (item, embedding) => {
  try {
    await findMatchesForItem(item)
  } catch (err) {
    console.warn('Background match computation failed (non-fatal):', err)
  }
}
