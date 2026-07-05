
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ─── Items Helpers ────────────────────────────────────────────────────────────

export const getItems = async ({ type, category, status = 'active', limit = 50, offset = 0 } = {}) => {
  let query = supabase
    .from('items')
    .select(`
      *,
      profiles:user_id (id, name, email, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.eq('type', type)
  if (category) query = query.eq('category', category)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getItemById = async (id) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles:user_id (id, name, email, avatar_url)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createItem = async (itemData) => {
  const { data, error } = await supabase
    .from('items')
    .insert([itemData])
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserItems = async (userId) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Matches Helpers ─────────────────────────────────────────────────────────

export const getMatchesForItem = async (itemId, itemType) => {
  const column = itemType === 'lost' ? 'lost_item_id' : 'found_item_id'
  const otherColumn = itemType === 'lost' ? 'found_item_id' : 'lost_item_id'

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      matched_item:${otherColumn} (
        id, title, description, category, image_url,
        location_name, status, type, created_at,
        profiles:user_id (id, name, avatar_url)
      )
    `)
    .eq(column, itemId)
    .order('total_score', { ascending: false })
    .limit(5)

  if (error) throw error
  return data
}

export const upsertMatch = async (lostItemId, foundItemId, scores) => {
  const { data, error } = await supabase
    .from('matches')
    .upsert({
      lost_item_id: lostItemId,
      found_item_id: foundItemId,
      text_score: scores.text,
      image_score: scores.image || 0,
      total_score: scores.total,
    }, { onConflict: 'lost_item_id,found_item_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Claims Helpers ───────────────────────────────────────────────────────────

export const createClaim = async (claimData) => {
  const { data, error } = await supabase
    .from('claims')
    .insert([claimData])
    .select()
    
  if (error) throw error
  if (!data || data.length === 0) throw new Error("Insert failed silently. This usually means a Row Level Security (RLS) policy blocked it, or the schema cache is still stale.")
  return data[0]
}

export const getClaimsForItem = async (itemId) => {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      claimant:claimant_id (id, name, email, avatar_url)
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getClaimByToken = async (token) => {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      item:item_id (id, title, category, image_url, status, type, location_name),
      claimant:claimant_id (id, name, avatar_url, email),
      finder:finder_id (id, name, avatar_url, email)
    `)
    .eq('qr_token', token)
    
  if (error) throw error
  return data?.[0] || null
}

export const getUserClaims = async (userId) => {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      item:item_id (id, title, category, image_url, status, type),
      claimant:claimant_id (id, name, avatar_url)
    `)
    .or(`claimant_id.eq.${userId},finder_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const updateClaimStatus = async (claimId, status, qrToken = null) => {
  const updates = { status }
  if (status === 'verified') {
    updates.verified_at = new Date().toISOString()
    updates.qr_token = qrToken
  }
  const { data, error } = await supabase
    .from('claims')
    .update(updates)
    .eq('id', claimId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export const uploadItemImage = async (file, userId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('item-images')
    .upload(fileName, file, { upsert: false })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('item-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

// ─── Stats Helpers ────────────────────────────────────────────────────────────

export const getStats = async () => {
  const [claimedRes, activeRes] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('status', 'claimed'),
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])
  return {
    resolved: claimedRes.count || 0,
    active: activeRes.count || 0,
  }
}

// ─── Heatmap Helpers ──────────────────────────────────────────────────────────

export const getHeatmapData = async () => {
  const { data, error } = await supabase
    .from('items')
    .select('location_lat, location_lng, location_name, type, category, status')
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null)

  if (error) throw error
  return data
}

// ─── Profile Helpers ──────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const upsertProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Aliases for page imports ─────────────────────────────────────────────────

/** Alias for getItemById (used by ItemDetail, ClaimFlow) */
export const getItem = getItemById

/** Alias for uploadItemImage with path parameter (used by ReportItem) */
export const uploadImage = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('item-images')
    .upload(path, file, { upsert: false })
  if (error) throw error
  const { data: urlData } = supabase.storage
    .from('item-images')
    .getPublicUrl(path)
  return urlData.publicUrl
}

/** Update item status field (used by ClaimFlow) */
export const updateItemStatus = async (itemId, status) => {
  const { data, error } = await supabase
    .from('items')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    
  if (error) throw error
  return data?.[0] || null
}

/** Get matches for an item by ID — returns both lost and found sides (used by ItemDetail) */
export const getMatches = async (itemId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      lost_items:lost_item_id (id, title, description, category, image_url, location_name, type, status, created_at),
      found_items:found_item_id (id, title, description, category, image_url, location_name, type, status, created_at)
    `)
    .or(`lost_item_id.eq.${itemId},found_item_id.eq.${itemId}`)
    .order('total_score', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}
