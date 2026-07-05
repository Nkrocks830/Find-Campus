import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, PlusCircle, ChevronDown, Check
} from 'lucide-react'
import { getItems } from '../lib/supabase'
import { CATEGORIES } from '../lib/huggingface'
import ItemCard from '../components/ItemCard'
import EmptyState, { SkeletonCard } from '../components/EmptyState'
import { DEMO_ITEMS, withDemoFallback } from '../lib/demoData'

const TYPES = [
  { value: 'all',   label: 'All Items' },
  { value: 'lost',  label: '🔍 Lost' },
  { value: 'found', label: '✅ Found' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
]

/* ─── Animated filter chip ──────────────────────────────────── */
function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? 'active' : ''}`}
      aria-pressed={active}
    >
      {active && <Check size={11} aria-hidden="true" />}
      {label}
    </button>
  )
}

/* ─── Sort dropdown ─────────────────────────────────────────── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = SORT_OPTIONS.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="btn btn-ghost btn-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.label}
        <ChevronDown size={13} style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="dropdown-menu"
            role="listbox"
            style={{ width: '160px', right: 0, left: 'auto', paddingBlock: '5px' }}
          >
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className={`dropdown-item ${value === opt.value ? 'active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false) }}
              >
                {opt.label}
                {value === opt.value && <Check size={13} className="check" aria-hidden="true" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Browse() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getItems({ type: typeFilter === 'all' ? null : typeFilter, status: 'active' })
      .then(data => setItems(withDemoFallback(data, DEMO_ITEMS)))
      .catch(() => setItems(DEMO_ITEMS))
      .finally(() => setLoading(false))
  }, [typeFilter])

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const filtered = items.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false
    const q = search.toLowerCase()
    if (q && !item.title?.toLowerCase().includes(q) &&
        !item.description?.toLowerCase().includes(q) &&
        !item.location_name?.toLowerCase().includes(q)) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.created_at), db = new Date(b.created_at)
    return sort === 'newest' ? db - da : da - db
  })

  const activeFilterCount = [
    typeFilter !== 'all',
    categoryFilter !== 'all',
  ].filter(Boolean).length

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div>
            <motion.h1
              className="text-h1"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--text-primary)', marginBottom: '6px' }}
            >
              Browse Items
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}
            >
              {loading ? 'Loading…' : `${sorted.length} item${sorted.length !== 1 ? 's' : ''} found`}
            </motion.p>
          </div>
          <Link to="/report" className="btn btn-primary" aria-label="Report a new lost or found item">
            <PlusCircle size={15} aria-hidden="true" />
            Report Item
          </Link>
        </div>

        {/* ── Search + Filter bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}
        >
          {/* Search */}
          <div className="form-field" style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} className="input-icon-left" style={{ top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                role="searchbox"
                aria-label="Search items by title, description, or location"
                placeholder="Search items… (press / to focus)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input has-icon-left"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', padding: '2px',
                  }}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`btn ${showFilters || activeFilterCount > 0 ? 'btn-secondary' : 'btn-ghost'}`}
            aria-expanded={showFilters}
            aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                minWidth: '18px', height: '18px', borderRadius: '9px',
                background: '#6366F1', color: 'white',
                fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <SortDropdown value={sort} onChange={setSort} />
        </motion.div>

        {/* ── Filter panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '16px 20px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                {/* Type filter */}
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Type
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {TYPES.map(t => (
                      <FilterChip
                        key={t.value}
                        label={t.label}
                        active={typeFilter === t.value}
                        onClick={() => setTypeFilter(t.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Category filter */}
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Category
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <FilterChip
                      label="All"
                      active={categoryFilter === 'all'}
                      onClick={() => setCategoryFilter('all')}
                    />
                    {CATEGORIES.map(cat => (
                      <FilterChip
                        key={cat.value}
                        label={`${cat.icon} ${cat.label}`}
                        active={categoryFilter === cat.value}
                        onClick={() => setCategoryFilter(cat.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { setTypeFilter('all'); setCategoryFilter('all') }}
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <X size={13} aria-hidden="true" />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Items grid ── */}
        {loading ? (
          <div className="grid-cards" aria-label="Loading items" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={search ? '🔍' : '📭'}
            title={search ? 'No matching items' : 'No items yet'}
            description={
              search
                ? `No results for "${search}". Try a different keyword or clear filters.`
                : 'Be the first to report a lost or found item on your campus!'
            }
            action={
              search
                ? <button onClick={() => setSearch('')} className="btn btn-secondary">Clear Search</button>
                : <Link to="/report" className="btn btn-primary">Report an Item</Link>
            }
          />
        ) : (
          <motion.div
            className="grid-cards"
            role="list"
            aria-label={`${sorted.length} items`}
          >
            <AnimatePresence mode="popLayout">
              {sorted.map((item, i) => (
                <div key={item.id} role="listitem">
                  <ItemCard item={item} index={i} />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
