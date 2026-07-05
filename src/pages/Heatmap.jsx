import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, AlertCircle } from 'lucide-react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import { getItems } from '../lib/supabase'
import { CATEGORIES } from '../lib/huggingface'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import 'leaflet/dist/leaflet.css'
import { DEMO_LOCATIONS, DEMO_ITEMS, DEMO_STATS } from '../lib/demoData'

const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

const DEFAULT_CENTER = [12.9716, 77.5946]
const DEFAULT_ZOOM  = 15

function getHeatColor(count, max) {
  const ratio = count / Math.max(max, 1)
  if (ratio >= 0.8) return { fill: '#EF4444', stroke: '#FCA5A5', label: 'Very High' }
  if (ratio >= 0.5) return { fill: '#F59E0B', stroke: '#FCD34D', label: 'High' }
  if (ratio >= 0.25) return { fill: '#6366F1', stroke: '#818CF8', label: 'Moderate' }
  return { fill: '#10B981', stroke: '#34D399', label: 'Low' }
}

function cluster(items) {
  const buckets = {}
  items.forEach(item => {
    if (!item.location_lat || !item.location_lng) return
    const key = (item.location_name || 'Unknown location').toLowerCase().trim()
    if (!buckets[key]) {
      buckets[key] = {
        lat: item.location_lat,
        lng: item.location_lng,
        name: item.location_name || 'Unknown location',
        items: [],
      }
    }
    buckets[key].items.push(item)
  })
  return Object.values(buckets).sort((a, b) => b.items.length - a.items.length)
}

export default function Heatmap() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getItems({ status: null })
      .then(data => {
        const filtered = data?.filter(i => i.location_lat) || []
        // If DB is empty, build fake items from demo location data
        if (filtered.length === 0) {
          const fakeItems = DEMO_LOCATIONS.flatMap(loc =>
            Array.from({ length: loc.count }, (_, i) => ({
              id: `fake-${loc.name}-${i}`,
              type: i % 2 === 0 ? 'lost' : 'found',
              location_name: loc.name,
              location_lat: loc.lat + (Math.random() - 0.5) * 0.001,
              location_lng: loc.lng + (Math.random() - 0.5) * 0.001,
            }))
          )
          setItems(fakeItems)
        } else {
          setItems(filtered)
        }
      })
      .catch(() => {
        const fakeItems = DEMO_LOCATIONS.flatMap(loc =>
          Array.from({ length: loc.count }, (_, i) => ({
            id: `fake-${loc.name}-${i}`,
            type: i % 2 === 0 ? 'lost' : 'found',
            location_name: loc.name,
            location_lat: loc.lat + (Math.random() - 0.5) * 0.001,
            location_lng: loc.lng + (Math.random() - 0.5) * 0.001,
          }))
        )
        setItems(fakeItems)
      })
      .finally(() => setLoading(false))
  }, [])

  const clusters = cluster(items)
  const maxCount = clusters[0]?.items.length || 1

  const mapCenter = clusters[0]
    ? [clusters[0].lat, clusters[0].lng]
    : DEFAULT_CENTER

  if (loading) return <LoadingSpinner fullscreen label="Loading heatmap…" />

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Header ── */}
        <div style={{ marginBottom: '28px' }}>
          <motion.h1
            className="text-h1"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: 'var(--text-primary)', marginBottom: '6px' }}
          >
            Campus Heatmap
          </motion.h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Hotspots where items are most frequently lost and found on campus.
          </p>
        </div>

        {/* ── Legend ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}
        >
          {[
            { color: '#EF4444', label: 'Very High' },
            { color: '#F59E0B', label: 'High' },
            { color: '#6366F1', label: 'Moderate' },
            { color: '#10B981', label: 'Low' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <MapPin size={12} aria-hidden="true" />
            {items.length} items with location data
          </div>
        </motion.div>

        {/* ── Main layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)', height: '540px' }}
          >
            {items.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)' }}>
                <EmptyState
                  compact
                  icon="🗺️"
                  title="No location data yet"
                  description="Items with location pins will appear here."
                />
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                zoomControl
                scrollWheelZoom={false}
                aria-label="Campus lost and found heatmap"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                />
                {clusters.map((c, i) => {
                  const { fill, stroke } = getHeatColor(c.items.length, maxCount)
                  const radius = 30 + (c.items.length / maxCount) * 100
                  return (
                    <Circle
                      key={i}
                      center={[c.lat, c.lng]}
                      radius={radius}
                      pathOptions={{
                        fillColor: fill,
                        fillOpacity: 0.35,
                        color: stroke,
                        weight: 2,
                        opacity: 0.8,
                      }}
                      eventHandlers={{ click: () => setSelected(c) }}
                    >
                      <Popup>
                        <div>
                          <strong style={{ fontSize: '14px' }}>{c.name}</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                            {c.items.length} item{c.items.length !== 1 ? 's' : ''} reported here
                          </p>
                        </div>
                      </Popup>
                    </Circle>
                  )
                })}
              </MapContainer>
            )}
          </motion.div>

          {/* Sidebar — hotspot ranking */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '80px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <TrendingUp size={16} color="#F59E0B" aria-hidden="true" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                Hotspot Ranking
              </h2>
            </div>

            {clusters.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', padding: '16px' }}>
                No location data yet. Report items with a location pin to populate this list.
              </p>
            ) : (
              clusters.slice(0, 10).map((c, i) => {
                const { fill, label } = getHeatColor(c.items.length, maxCount)
                const lostCount  = c.items.filter(it => it.type === 'lost').length
                const foundCount = c.items.filter(it => it.type === 'found').length
                const isSelected = selected?.name === c.name

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => setSelected(isSelected ? null : c)}
                    style={{
                      padding: '14px',
                      background: isSelected ? 'rgba(79,70,229,0.08)' : 'var(--bg-elevated)',
                      border: `1px solid ${isSelected ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-card)' } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)' } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      {/* Rank */}
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                        background: i === 0 ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700,
                        color: i === 0 ? '#F59E0B' : 'var(--text-muted)',
                      }}>
                        {i + 1}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                          <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.name}
                          </p>
                          <span style={{
                            padding: '2px 7px', borderRadius: '9px',
                            fontSize: '10px', fontWeight: 700,
                            background: `${fill}20`, color: fill,
                            flexShrink: 0,
                          }}>
                            {label}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: '3px', background: 'var(--border-default)', borderRadius: '2px', marginBottom: '8px' }}>
                          <div style={{
                            height: '100%', borderRadius: '2px',
                            width: `${(c.items.length / maxCount) * 100}%`,
                            background: fill,
                            transition: 'width 600ms ease',
                          }} />
                        </div>

                        {/* Lost/Found counts */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#FCA5A5' }}>🔍 {lostCount} lost</span>
                          <span style={{ fontSize: '11px', color: '#6EE7B7' }}>✅ {foundCount} found</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </div>

        {/* Stats row */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginTop: '24px' }}
          >
            {[
              { label: 'Total Items', value: items.length, color: '#818CF8' },
              { label: 'Unique Locations', value: clusters.length, color: '#F59E0B' },
              { label: 'Items Lost', value: items.filter(i => i.type === 'lost').length, color: '#FCA5A5' },
              { label: 'Items Found', value: items.filter(i => i.type === 'found').length, color: '#6EE7B7' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: s.color }}>{s.value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .heatmap-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
