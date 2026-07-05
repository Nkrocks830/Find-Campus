import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, PlusCircle } from 'lucide-react'

/**
 * Skeleton card for loading state — matches ItemCard dimensions
 */
export function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Image skeleton */}
      <div className="skeleton" style={{ height: '188px', borderRadius: 0 }} />
      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '13px', width: '65%', marginBottom: '4px' }} />
          <div className="skeleton" style={{ height: '13px', width: '50%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="skeleton" style={{ height: '12px', width: '40%' }} />
          <div className="skeleton" style={{ height: '12px', width: '55%' }} />
          <div className="skeleton" style={{ height: '12px', width: '30%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="skeleton" style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0 }} />
          <div className="skeleton" style={{ height: '12px', width: '35%' }} />
        </div>
      </div>
    </div>
  )
}

/**
 * Generic skeleton row (for list views)
 */
export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '14px', width: '55%' }} />
        <div className="skeleton" style={{ height: '12px', width: '35%' }} />
      </div>
      <div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: 'var(--radius-full)' }} />
    </div>
  )
}

/**
 * Stat card skeleton
 */
export function SkeletonStat() {
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)' }} />
      <div className="skeleton" style={{ height: '28px', width: '50%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '12px', width: '65%', borderRadius: '6px' }} />
    </div>
  )
}

/**
 * Premium empty state with icon, heading, body, and optional CTA
 */
export default function EmptyState({ icon = '🔍', title, description, action, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-label={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '40px 24px' : '72px 32px',
        gap: compact ? '12px' : '16px',
      }}
    >
      {/* Icon container */}
      <div style={{
        width: compact ? '64px' : '80px',
        height: compact ? '64px' : '80px',
        borderRadius: 'var(--radius-2xl)',
        background: 'rgba(79,70,229,0.06)',
        border: '1px solid rgba(79,70,229,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: compact ? '2rem' : '2.5rem',
        lineHeight: 1,
        marginBottom: compact ? '4px' : '8px',
      }}>
        {icon}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: compact ? 'var(--text-lg)' : 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
        }}>
          {description}
        </p>
      </div>

      {action && (
        <div style={{ marginTop: compact ? '8px' : '12px' }}>
          {action}
        </div>
      )}
    </motion.div>
  )
}
