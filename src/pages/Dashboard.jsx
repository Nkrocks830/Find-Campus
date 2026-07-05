import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  PlusCircle, LayoutDashboard, Package, CheckCircle,
  Clock, MapPin, Tag, ArrowRight, QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import { getUserItems, getUserClaims } from '../lib/supabase'
import { SkeletonCard, SkeletonRow } from '../components/EmptyState'
import EmptyState from '../components/EmptyState'
import QRModal from '../components/QRModal'
import { CATEGORIES } from '../lib/huggingface'
import {
  DEMO_ITEMS, DEMO_CLAIMS, DEMO_STATS, DEMO_ACTIVITY,
  DEMO_WEEKLY_CHART, DEMO_CATEGORY_BREAKDOWN
} from '../lib/demoData'

const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

function timeAgo(d) {
  const diff = Date.now() - new Date(d)
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={19} color={color} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{label}</div>
      </div>
    </motion.div>
  )
}

function ItemRow({ item, onQR }) {
  const cat = categoryMap[item.category] || categoryMap['other']
  const isLost = item.type === 'lost'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        transition: 'all 200ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-card)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
    >
      {/* Thumb */}
      <div style={{
        width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} aria-hidden="true" />{timeAgo(item.created_at)}
          </span>
          {item.location_name && (
            <span style={{ fontSize: '11px', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              <MapPin size={10} aria-hidden="true" />{item.location_name}
            </span>
          )}
        </div>
      </div>

      {/* Badges + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span className={`badge badge-${isLost ? 'lost' : 'found'}`}>{isLost ? 'Lost' : 'Found'}</span>
        <span className={`badge badge-${item.status}`}>{item.status}</span>
        <Link
          to={`/item/${item.id}`}
          className="btn btn-ghost btn-icon btn-sm"
          aria-label={`View ${item.title}`}
        >
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
        {item.claim_qr_token && (
          <button
            onClick={() => onQR(item)}
            className="btn btn-secondary btn-icon btn-sm"
            aria-label="Show QR code"
          >
            <QrCode size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

const TABS = [
  { id: 'reports', label: 'My Reports', icon: Package },
  { id: 'claims',  label: 'My Claims',  icon: CheckCircle },
]

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const [tab, setTab] = useState('reports')
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrItem, setQrItem] = useState(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      getUserItems(user.id).catch(() => []),
      getUserClaims(user.id).catch(() => []),
    ]).then(([its, cls]) => {
      setItems(its || [])
      setClaims(cls || [])
    }).finally(() => setLoading(false))
  }, [user])

  const lostCount     = items.filter(i => i.type === 'lost').length
  const foundCount    = items.filter(i => i.type === 'found').length
  const claimedCount  = items.filter(i => i.status === 'claimed').length
  const displayName   = profile?.name || user?.email?.split('@')[0] || 'Student'
  const avatar        = displayName[0].toUpperCase()

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Profile header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 800, color: 'white',
            boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
          }} aria-hidden="true">{avatar}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Hey, {displayName} 👋
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>
              {user?.email}
            </p>
          </div>
          <Link to="/report" className="btn btn-primary">
            <PlusCircle size={15} aria-hidden="true" />
            Report Item
          </Link>
        </motion.div>

        {/* ── Stats ── */}
        {loading
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '6px' }} />
                    <div className="skeleton" style={{ height: '12px', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <StatCard icon={Package}      value={lostCount}   label="Items Lost"    color="#FCA5A5" />
              <StatCard icon={LayoutDashboard} value={foundCount} label="Items Found"  color="#6EE7B7" />
              <StatCard icon={CheckCircle}  value={claimedCount} label="Items Claimed" color="#818CF8" />
            </div>
        }

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="tab-list" role="tablist" aria-label="Dashboard sections">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              >
                <t.icon size={14} aria-hidden="true" />
                {t.label}
                <span style={{
                  minWidth: '18px', height: '18px', borderRadius: '9px', padding: '0 4px',
                  background: tab === t.id ? 'rgba(99,102,241,0.25)' : 'var(--bg-card)',
                  fontSize: '10px', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: tab === t.id ? '#A5B4FC' : 'var(--text-muted)',
                }}>
                  {t.id === 'reports' ? items.length : claims.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
              </motion.div>
            ) : tab === 'reports' ? (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {items.length === 0
                  ? <EmptyState
                      icon="📭"
                      title="No reports yet"
                      description="You haven't reported any lost or found items. Start by creating your first report!"
                      action={<Link to="/report" className="btn btn-primary"><PlusCircle size={15} />Report an Item</Link>}
                    />
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(item => <ItemRow key={item.id} item={item} onQR={setQrItem} />)}
                    </div>
                }
              </motion.div>
            ) : (
              <motion.div key="claims" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {claims.length === 0
                  ? <EmptyState
                      icon="🤝"
                      title="No claims yet"
                      description="You haven't claimed any items. Browse items to see if yours has been found!"
                      action={<Link to="/browse" className="btn btn-secondary">Browse Items</Link>}
                    />
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {claims.map(claim => (
                        <div key={claim.id} style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '14px 16px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                              {claim.items?.title || 'Unknown item'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>
                              Claimed {timeAgo(claim.created_at)}
                            </div>
                          </div>
                          <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                          {claim.qr_token && claim.status === 'verified' && (
                            <button
                              onClick={() => setQrItem({ ...claim.items, claim_qr_token: claim.qr_token })}
                              className="btn btn-secondary btn-sm"
                              aria-label="Show QR proof"
                            >
                              <QrCode size={13} aria-hidden="true" />
                              QR Proof
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Activity Feed + Global Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginTop: '32px' }}>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
            style={{ padding: '20px' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Campus Activity Feed
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {DEMO_ACTIVITY.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  style={{
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    padding: '11px 0',
                    borderBottom: i < DEMO_ACTIVITY.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                    background: `${a.color}12`, border: `1px solid ${a.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.text}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-disabled)', marginTop: '3px' }}>
                      {timeAgo(a.time)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Global stats panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {/* Platform stats */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px' }}>
                🏫 Campus Totals
              </h2>
              {[
                { label: 'Total Items Reported', value: DEMO_STATS.totalItems, color: '#818CF8' },
                { label: 'Active Reports',        value: DEMO_STATS.activeItems, color: '#F59E0B' },
                { label: 'Successfully Claimed',  value: DEMO_STATS.claimedItems, color: '#10B981' },
                { label: 'Registered Students',   value: DEMO_STATS.totalUsers, color: '#60A5FA' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Weekly bar chart */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px' }}>
                📊 This Week
              </h2>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '80px' }}>
                {DEMO_WEEKLY_CHART.map(d => {
                  const maxVal = 20
                  return (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', height: '64px', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', height: `${(d.found / maxVal) * 100}%`, background: 'rgba(16,185,129,0.6)', borderRadius: '3px 3px 0 0', minHeight: '3px' }} title={`Found: ${d.found}`} />
                        <div style={{ width: '100%', height: `${(d.lost / maxVal) * 100}%`, background: 'rgba(239,68,68,0.5)', borderRadius: '3px 3px 0 0', minHeight: '3px' }} title={`Lost: ${d.lost}`} />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: '4px' }}>{d.day}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(239,68,68,0.5)', display: 'inline-block' }} />Lost</span>
                <span style={{ fontSize: '11px', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(16,185,129,0.6)', display: 'inline-block' }} />Found</span>
              </div>
            </div>

            {/* Quick nav */}
            <div className="card" style={{ padding: '14px' }}>
              {[
                { to: '/browse',  icon: '🔍', label: 'Browse All Items' },
                { to: '/heatmap', icon: '🗺️', label: 'View Heatmap' },
                { to: '/report',  icon: '➕', label: 'Report an Item' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 8px',
                  textDecoration: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <span style={{ fontSize: '16px' }}>{l.icon}</span>
                  {l.label}
                  <ArrowRight size={12} style={{ marginLeft: 'auto' }} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {qrItem && (
          <QRModal
            token={qrItem.claim_qr_token}
            itemTitle={qrItem.title}
            onClose={() => setQrItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
