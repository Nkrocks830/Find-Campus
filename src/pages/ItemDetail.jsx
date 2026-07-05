import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, Tag, User, ArrowLeft, Shield,
  Zap, ChevronRight, AlertCircle, ExternalLink, Image
} from 'lucide-react'
import { getItem, getMatches } from '../lib/supabase'
import { CATEGORIES } from '../lib/huggingface'
import useAuthStore from '../stores/authStore'
import MatchScoreReveal from '../components/MatchScoreReveal'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { DEMO_ITEMS, DEMO_MATCHES } from '../lib/demoData'

const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

function timeAgo(d) {
  const diff = Date.now() - new Date(d)
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (m < 60) return `${m} minute${m !== 1 ? 's' : ''} ago`
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function MetaRow({ icon: Icon, label, value, color }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        background: color ? `${color}10` : 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={color || 'var(--text-muted)'} aria-hidden="true" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '11px', color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  )
}

function MatchCard({ match, type, index }) {
  const item = type === 'lost' ? match.lost_items : match.found_items
  const score = match.total_score || 0
  const cat = categoryMap[item?.category] || categoryMap['other']

  if (!item) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/item/${item.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 200ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
            e.currentTarget.style.background = 'var(--bg-card)'
            e.currentTarget.style.transform = 'translateX(4px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
            e.currentTarget.style.background = 'var(--bg-elevated)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          {/* Thumbnail */}
          <div style={{
            width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem',
          }}>
            {item.image_url
              ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : cat.icon}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </p>
            {item.location_name && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={9} aria-hidden="true" /> {item.location_name}
              </p>
            )}
          </div>

          {/* Score ring */}
          <MatchScoreReveal score={score} size={52} />
        </div>
      </Link>
    </motion.div>
  )
}

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [item, setItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgExpanded, setImgExpanded] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getItem(id).catch(() => null), getMatches(id).catch(() => [])])
      .then(([it, mx]) => {
        // If no real item found, try demo items by id
        const resolvedItem = it || DEMO_ITEMS.find(d => d.id === id) || DEMO_ITEMS[0]
        const resolvedMatches = mx?.length ? mx : DEMO_MATCHES.filter(
          m => m.lost_item_id === id || m.found_item_id === id
        )
        setItem(resolvedItem)
        setMatches(resolvedMatches)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner fullscreen label="Loading item…" />

  if (!item) return (
    <div className="page-wrapper">
      <EmptyState
        icon="😕"
        title="Item not found"
        description="This item may have been removed or the link is invalid."
        action={<Link to="/browse" className="btn btn-primary">Browse All Items</Link>}
      />
    </div>
  )

  const cat     = categoryMap[item.category] || categoryMap['other']
  const isLost  = item.type === 'lost'
  const isOwner = user?.id === item.user_id
  const typeColor = isLost ? '#FCA5A5' : '#6EE7B7'
  const typeBg    = isLost ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'
  const typeBdr   = isLost ? 'rgba(239,68,68,0.2)'  : 'rgba(16,185,129,0.2)'

  const canClaim = !isOwner && user && item.status === 'active' && !isLost

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '24px' }}
          aria-label="Go back"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{
                overflow: 'hidden',
                background: item.image_url ? 'var(--bg-card)' : 'var(--bg-elevated)',
                cursor: item.image_url ? 'zoom-in' : 'default',
              }}
              onClick={() => item.image_url && setImgExpanded(true)}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block', transition: 'transform 300ms' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                />
              ) : (
                <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <Image size={48} color="var(--text-disabled)" aria-hidden="true" />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-disabled)' }}>No photo attached</p>
                </div>
              )}
            </motion.div>

            {/* Title + badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 11px', borderRadius: 'var(--radius-full)',
                  fontSize: '12px', fontWeight: 600,
                  background: typeBg, border: `1px solid ${typeBdr}`, color: typeColor,
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: typeColor, flexShrink: 0 }} />
                  {isLost ? 'Lost Item' : 'Found Item'}
                </span>
                <span className={`badge badge-${item.status}`}>{item.status}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {cat.icon} {cat.label}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px' }}>
                {item.title}
              </h1>

              {item.description && (
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.description}
                </p>
              )}
            </motion.div>

            {/* Meta details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card"
              style={{ padding: '8px 20px' }}
            >
              <MetaRow icon={MapPin} label="Location" value={item.location_name} color="#FB7185" />
              <MetaRow icon={Clock}  label="Reported" value={timeAgo(item.created_at)} color="#818CF8" />
              <MetaRow icon={Tag}    label="Category" value={`${cat.icon} ${cat.label}`} color="#F59E0B" />
              {item.profiles && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: 'white',
                  }} aria-hidden="true">
                    {(item.profiles.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-disabled)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Reported by</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.profiles.name || 'Anonymous'}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>

            {/* Claim CTA */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
              style={{ padding: '22px', overflow: 'hidden', position: 'relative' }}
            >
              {/* Glow bg */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {isOwner ? (
                <div className="alert alert-info" style={{ marginBottom: 0 }}>
                  <User size={15} className="alert-icon" aria-hidden="true" />
                  <span>This is your report. Share the link so others can see it.</span>
                </div>
              ) : !user ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Sign in to claim this item or report a match.
                  </p>
                  <Link to="/auth" className="btn btn-primary btn-w-full">
                    Sign In to Claim
                    <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              ) : item.status !== 'active' ? (
                <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                  <AlertCircle size={15} className="alert-icon" aria-hidden="true" />
                  <span>This item is <strong>{item.status}</strong> and no longer available.</span>
                </div>
              ) : isLost ? (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                    Found this item? Click below to contact the owner and initiate a handover.
                  </p>
                  <Link to={`/claim/${item.id}`} className="btn btn-primary btn-w-full btn-lg">
                    <Shield size={16} aria-hidden="true" />
                    I Found This!
                    <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                    Is this your item? Answer the security question to verify and claim it.
                  </p>
                  <Link to={`/claim/${item.id}`} className="btn btn-primary btn-w-full btn-lg">
                    <Shield size={16} aria-hidden="true" />
                    Claim This Item
                    <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* AI Matches */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
              style={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'rgba(99,102,241,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={14} color="#818CF8" aria-hidden="true" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                  AI Match Suggestions
                </h2>
                {matches.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(99,102,241,0.12)',
                    fontSize: '11px', fontWeight: 700, color: '#818CF8',
                  }}>{matches.length}</span>
                )}
              </div>

              {matches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: '1.75rem', marginBottom: '8px' }}>🔍</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    No matches yet. As more items are reported, AI matches will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {matches.slice(0, 5).map((match, i) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      type={isLost ? 'found' : 'lost'}
                      index={i}
                    />
                  ))}
                  {matches.length > 5 && (
                    <Link to="/browse" style={{
                      textAlign: 'center', padding: '10px',
                      fontSize: '12px', color: '#818CF8',
                      textDecoration: 'none',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '4px', display: 'block',
                    }}>
                      View all {matches.length} matches →
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {imgExpanded && item.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImgExpanded(false)}
            role="dialog"
            aria-label="Full-size image"
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px', cursor: 'zoom-out',
            }}
          >
            <motion.img
              src={item.image_url}
              alt={item.title}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .item-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
