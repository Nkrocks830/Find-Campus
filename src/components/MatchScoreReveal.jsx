import { motion } from 'framer-motion'
import { getMatchLabel } from '../lib/matching'

export default function MatchScoreReveal({ score, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - score * circumference
  const percent = Math.round(score * 100)
  const { label, color } = getMatchLabel(score)

  const strokeColor = score >= 0.8 ? '#10B981'
    : score >= 0.6 ? '#F59E0B'
    : score >= 0.35 ? '#6366F1'
    : '#475569'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: size, height: size }} role="img" aria-label={`${percent}% match — ${label}`}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={5}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          />
        </svg>
        {/* Center percent */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: size > 64 ? '1.125rem' : size > 48 ? '0.875rem' : '0.75rem',
              color: strokeColor,
              lineHeight: 1,
            }}
          >
            {percent}%
          </motion.span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ fontSize: '11px', fontWeight: 600, color: strokeColor, textAlign: 'center' }}
      >
        {label}
      </motion.p>
    </div>
  )
}
