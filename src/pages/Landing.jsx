import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import {
  Search, PlusCircle, MapPin, Zap, Shield,
  QrCode, TrendingUp, ArrowRight, CheckCircle, Sparkles
} from 'lucide-react'
import { getStats } from '../lib/supabase'
import { DEMO_STATS } from '../lib/demoData'

/* ─── Animated counter ───────────────────────────────────────── */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Feature card ───────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="card"
        style={{ padding: '28px', height: '100%', transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${color}40`
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}20`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div
          style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: `${color}15`,
            border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Icon size={20} color={color} aria-hidden="true" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

const FEATURES = [
  {
    icon: Zap, color: '#818CF8',
    title: 'AI Match Scoring',
    description: 'Sentence embeddings compare every lost and found report. You see a percentage match score — no more manual scanning.',
  },
  {
    icon: Shield, color: '#10B981',
    title: 'Claim Verification',
    description: "The finder sets a security question only the true owner can answer. No admin needed — fraud-proof by design.",
  },
  {
    icon: QrCode, color: '#F59E0B',
    title: 'QR Handover Proof',
    description: 'Verified claims generate a unique QR code — a digital receipt for the handover that both parties can keep.',
  },
  {
    icon: MapPin, color: '#FB7185',
    title: 'Campus Heatmap',
    description: 'See where items are lost and found most on campus. Spot patterns, improve security coverage.',
  },
  {
    icon: TrendingUp, color: '#34D399',
    title: 'Smart Auto-Tagging',
    description: 'Describe your item and the AI suggests the right category automatically — faster reports, better search.',
  },
  {
    icon: Search, color: '#60A5FA',
    title: 'Instant Search',
    description: 'Filter by type, category, location, and status. Find what you\'re looking for in seconds, not minutes.',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Report It', desc: 'Post your lost or found item with a photo, location pin, and description in under 60 seconds.', color: '#818CF8' },
  { step: '02', title: 'AI Matches', desc: 'Our AI compares your report to all others and shows ranked match scores instantly — no manual searching.', color: '#10B981' },
  { step: '03', title: 'Verify & Claim', desc: 'Answer the finder\'s security question to prove ownership. No false claims, no admin overhead.', color: '#F59E0B' },
  { step: '04', title: 'QR Handover', desc: 'Get your unique QR code — a digital proof of return. Both parties have a verified record.', color: '#FB7185' },
]

export default function Landing() {
  const [stats, setStats] = useState({ total: 0, matched: 0, locations: 0 })

  useEffect(() => {
    getStats()
      .then(s => {
        if (s && (s.total || s.resolved || s.active)) {
          setStats({ total: (s.total || 0) + (s.resolved || 0), matched: 73, locations: 18 })
        } else {
          setStats({ total: DEMO_STATS.total, matched: DEMO_STATS.matched, locations: DEMO_STATS.locations })
        }
      })
      .catch(() => setStats({ total: DEMO_STATS.total, matched: DEMO_STATS.matched, locations: DEMO_STATS.locations }))
  }, [])

  return (
    <main>
      {/* ══ HERO ═════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '96px',
          paddingBottom: '120px',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="orb" style={{ width: '600px', height: '600px', top: '-200px', left: '-200px', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)' }} />
          <div className="orb" style={{ width: '500px', height: '500px', top: '100px', right: '-100px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
          <div className="orb" style={{ width: '400px', height: '400px', bottom: '-100px', left: '30%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '760px', marginInline: 'auto', textAlign: 'center' }}>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px', fontWeight: 600,
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#A5B4FC',
                letterSpacing: '0.02em',
              }}>
                <Sparkles size={12} aria-hidden="true" />
                AI-Powered Campus Lost &amp; Found
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: 'var(--text-primary)', marginBottom: '24px' }}
            >
              Lost something on{' '}
              <span className="gradient-text">campus?</span>
              <br />
              We'll{' '}
              <span style={{
                position: 'relative',
                display: 'inline-block',
              }}>
                <span className="gradient-text-amber">Find It.</span>
                <svg
                  viewBox="0 0 200 12" fill="none"
                  style={{ position: 'absolute', bottom: '-6px', left: 0, width: '100%', height: '12px' }}
                  aria-hidden="true"
                >
                  <path d="M2 10 Q100 2 198 8" stroke="url(#ul)" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="ul" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F59E0B"/>
                      <stop offset="1" stopColor="#FCD34D"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              className="text-body-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '520px', marginInline: 'auto' }}
            >
              Smart AI matching connects lost items with found reports. No more endless scrolling — see match scores instantly and claim with verification.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link to="/report?type=lost" className="btn btn-primary btn-lg" aria-label="Report a lost item">
                <Search size={18} aria-hidden="true" />
                I Lost Something
              </Link>
              <Link to="/report?type=found" className="btn btn-amber btn-lg" aria-label="Report a found item">
                <PlusCircle size={18} aria-hidden="true" />
                I Found Something
              </Link>
              <Link to="/browse" className="btn btn-ghost btn-lg">
                Browse All Items
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: 'flex', justifyContent: 'center', gap: '0',
              marginTop: '72px',
              maxWidth: '600px', marginInline: 'auto',
            }}
          >
            {[
              { value: stats.total || 0, suffix: '+', label: 'Items Reported', color: '#818CF8' },
              { value: stats.matched || 0, suffix: '%', label: 'Match Rate', color: '#10B981' },
              { value: stats.locations || 0, suffix: '', label: 'Campus Locations', color: '#F59E0B' },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                {i > 0 && <div className="divider-v" style={{ position: 'absolute', left: 0, top: '10%', height: '80%' }} />}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section className="section" style={{ background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <motion.p
              className="text-label"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ marginBottom: '12px' }}
            >
              How it works
            </motion.p>
            <motion.h2
              className="text-h1"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: 'var(--text-primary)' }}
            >
              From lost to found in{' '}
              <span className="gradient-text-primary">4 steps</span>
            </motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', position: 'relative' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '32px 28px', position: 'relative' }}
              >
                {/* Step number */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  color: `${step.color}10`,
                  lineHeight: 1,
                  marginBottom: '20px',
                  userSelect: 'none',
                }}>
                  {step.step}
                </div>
                <div
                  style={{
                    width: '36px', height: '3px', borderRadius: '2px',
                    background: step.color,
                    marginBottom: '16px',
                  }}
                />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {step.desc}
                </p>

                {/* Connector arrow (not on last) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: 'absolute', right: '-16px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--border-default)',
                    fontSize: '1.5rem',
                    zIndex: 1,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <ArrowRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <motion.p
              className="text-label"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ marginBottom: '12px' }}
            >
              Features
            </motion.p>
            <motion.h2
              className="text-h1"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: 'var(--text-primary)' }}
            >
              Built for real campus life
            </motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════ */}
      <section className="section-sm">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '56px 40px',
              borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.1) 50%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              textAlign: 'center',
            }}
          >
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(79,70,229,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎓</div>
              <h2 className="text-h1" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                Ready to find what's yours?
              </h2>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '440px', marginInline: 'auto' }}>
                Join thousands of students who've already used FindIt Campus to recover their lost items.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/auth" className="btn btn-primary btn-lg">
                  Get Started Free
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/browse" className="btn btn-ghost btn-lg">
                  Browse Items
                </Link>
              </div>
              <p style={{ marginTop: '20px', fontSize: 'var(--text-sm)', color: 'var(--text-disabled)' }}>
                No credit card required · Free forever for students
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', paddingBlock: '32px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'white' }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>FindIt<span style={{ color: '#818CF8' }}>Campus</span></span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>
            © 2025 FindIt Campus · Built with ❤️ for students
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/browse" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Browse</Link>
            <Link to="/heatmap" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Heatmap</Link>
            <Link to="/auth" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
