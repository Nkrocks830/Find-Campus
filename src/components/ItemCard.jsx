import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Tag } from 'lucide-react'
import { CATEGORIES } from '../lib/huggingface'

const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 60)  return `${m}m ago`
  if (h < 24)  return `${h}h ago`
  if (d < 7)   return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const typeConfig = {
  lost:  { label: 'Lost',  color: '#FCA5A5', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   dot: '#EF4444' },
  found: { label: 'Found', color: '#6EE7B7', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  dot: '#10B981' },
}
const statusConfig = {
  active:   { label: 'Active',   cls: 'badge-active' },
  matched:  { label: 'Matched',  cls: 'badge-matched' },
  claimed:  { label: 'Claimed',  cls: 'badge-claimed' },
  archived: { label: 'Archived', cls: 'badge-archived' },
}

export default function ItemCard({ item, matchScore, index = 0 }) {
  const cat    = categoryMap[item.category] || categoryMap['other']
  const type   = typeConfig[item.type] || typeConfig.lost
  const status = statusConfig[item.status] || statusConfig.active
  const isNonActive = item.status !== 'active'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ height: '100%' }}
    >
      <Link
        to={`/item/${item.id}`}
        aria-label={`${item.title} — ${type.label} item`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div
          className="card card-interactive"
          style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden',
            transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* ── Image ── */}
          <div style={{ position: 'relative', height: '188px', flexShrink: 0, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '2.75rem', lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-disabled)', fontWeight: 500 }}>No photo</span>
              </div>
            )}

            {/* Type pill */}
            <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px', fontWeight: 600,
                background: 'rgba(7,8,15,0.75)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${type.border}`,
                color: type.color,
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: type.dot, flexShrink: 0 }} />
                {type.label}
              </span>
            </div>

            {/* Match score badge */}
            {matchScore > 0.15 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px', fontWeight: 700,
                  background: matchScore >= 0.7 ? 'rgba(16,185,129,0.85)' : matchScore >= 0.45 ? 'rgba(79,70,229,0.85)' : 'rgba(245,158,11,0.85)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                }}>
                  🎯 {Math.round(matchScore * 100)}%
                </span>
              </motion.div>
            )}

            {/* Non-active overlay */}
            {isNonActive && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(7,8,15,0.65)',
                backdropFilter: 'blur(2px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className={`badge ${status.cls}`} style={{ fontSize: '12px', padding: '5px 14px' }}>
                  {status.label}
                </span>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {/* Title */}
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
                lineHeight: 1.35,
                marginBottom: '5px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {item.title}
              </h3>
              {item.description && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.55 }} className="truncate-2">
                  {item.description}
                </p>
              )}
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Tag size={11} aria-hidden="true" />
                <span>{cat.icon} {cat.label}</span>
              </div>
              {item.location_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <MapPin size={11} aria-hidden="true" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location_name}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-disabled)' }}>
                <Clock size={11} aria-hidden="true" />
                <span><time dateTime={item.created_at}>{timeAgo(item.created_at)}</time></span>
              </div>
            </div>

            {/* Reporter */}
            {item.profiles && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: 'white', flexShrink: 0,
                }} aria-hidden="true">
                  {(item.profiles.name || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.profiles.name || 'Anonymous'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
