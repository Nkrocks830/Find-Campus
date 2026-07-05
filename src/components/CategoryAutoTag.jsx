import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Check, ChevronDown, Sparkles, Loader2 } from 'lucide-react'
import { CATEGORIES, suggestCategory } from '../lib/huggingface'

export default function CategoryAutoTag({ description, value, onChange }) {
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const btnRef  = useRef(null)

  // AI suggestion debounce
  useEffect(() => {
    if (!description || description.length < 10) return
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await suggestCategory(description)
        if (res.category !== 'other' || res.confidence > 0.5) setSuggestion(res)
      } catch {}
      finally { setLoading(false) }
    }, 800)
    return () => clearTimeout(t)
  }, [description])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Keyboard nav
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v) }
  }

  const selected = CATEGORIES.find(c => c.value === value) || CATEGORIES.at(-1)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* AI suggestion banner */}
      <AnimatePresence>
        {suggestion && suggestion.category !== value && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="alert alert-info"
            style={{ marginBottom: '10px', overflow: 'hidden' }}
          >
            <Sparkles size={14} className="alert-icon" aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>
                AI suggests: {CATEGORIES.find(c => c.value === suggestion.category)?.icon}{' '}
                {CATEGORIES.find(c => c.value === suggestion.category)?.label}
              </span>
              {suggestion.confidence > 0 && (
                <span style={{ color: 'rgba(165,180,252,0.6)', fontSize: '12px', marginLeft: '6px' }}>
                  {Math.round(suggestion.confidence * 100)}% confident
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => { onChange(suggestion.category); setSuggestion(null) }}
              style={{
                flexShrink: 0, fontSize: '12px', fontWeight: 600,
                padding: '4px 10px', borderRadius: '6px',
                background: 'rgba(99,102,241,0.2)', color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)' }}
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI loading indicator */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Loader2 size={12} style={{ animation: 'spin 0.75s linear infinite' }} aria-hidden="true" />
          Analyzing category with AI…
        </div>
      )}

      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select category: currently ${selected.label}`}
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleKeyDown}
        className="input"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none', textAlign: 'left',
          ...(open ? {
            borderColor: 'rgba(99,102,241,0.6)',
            background: 'rgba(79,70,229,0.04)',
            boxShadow: '0 0 0 3px rgba(79,70,229,0.1)',
          } : {}),
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          <span style={{ fontSize: '1.1em', lineHeight: 1 }}>{selected.icon}</span>
          {selected.label}
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 200ms',
            transform: open ? 'rotate(180deg)' : 'none',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="dropdown-menu"
            role="listbox"
            aria-label="Select category"
            style={{ paddingBlock: '6px' }}
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                role="option"
                aria-selected={value === cat.value}
                onClick={() => { onChange(cat.value); setOpen(false); setSuggestion(null) }}
                className={`dropdown-item ${value === cat.value ? 'active' : ''}`}
              >
                <span style={{ fontSize: '1.1em', lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.label}</span>
                {value === cat.value && (
                  <Check size={14} className="check" aria-hidden="true" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
