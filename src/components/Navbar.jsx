import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, MapPin, LayoutDashboard, PlusCircle, LogOut, Menu, X } from 'lucide-react'
import useAuthStore from '../stores/authStore'

const NAV_LINKS = [
  { to: '/browse', label: 'Browse', icon: Search },
  { to: '/heatmap', label: 'Heatmap', icon: MapPin },
]

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const displayName = profile?.name || user?.email?.split('@')[0] || 'U'
  const avatar = displayName[0].toUpperCase()

  return (
    <>
      <header
        role="banner"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '64px',
          transition: `all 250ms cubic-bezier(0.16,1,0.3,1)`,
          background: scrolled
            ? 'rgba(7,8,15,0.92)'
            : 'rgba(7,8,15,0.7)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <nav className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          {/* Logo */}
          <Link
            to="/"
            aria-label="FindIt Campus — Home"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 800, color: 'white',
              boxShadow: '0 2px 12px rgba(79,70,229,0.4)',
              flexShrink: 0,
            }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              FindIt<span style={{ color: '#818CF8' }}>Campus</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div role="navigation" aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color: isActive(link.to) ? '#818CF8' : 'var(--text-secondary)',
                  background: isActive(link.to) ? 'rgba(99,102,241,0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <link.icon size={15} aria-hidden="true" />
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/dashboard"
                aria-current={isActive('/dashboard') ? 'page' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive('/dashboard') ? 600 : 500,
                  color: isActive('/dashboard') ? '#818CF8' : 'var(--text-secondary)',
                  background: isActive('/dashboard') ? 'rgba(99,102,241,0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => { if (!isActive('/dashboard')) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!isActive('/dashboard')) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <LayoutDashboard size={15} aria-hidden="true" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right actions — desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {user ? (
              <>
                <Link to="/report" className="btn btn-primary btn-sm" aria-label="Report a lost or found item">
                  <PlusCircle size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">Report Item</span>
                </Link>

                {/* Avatar menu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    aria-label={`Signed in as ${displayName}`}
                    style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: 'white',
                      flexShrink: 0,
                      cursor: 'default',
                    }}
                  >
                    {avatar}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-sm"
                    aria-label="Sign out"
                  >
                    <LogOut size={14} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/auth" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }}
            style={{
              position: 'fixed',
              top: '64px',
              left: 0, right: 0,
              zIndex: 99,
              background: 'rgba(7,8,15,0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid var(--border-default)',
              padding: '16px',
            }}
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '480px', margin: '0 auto' }}>
              {[...NAV_LINKS, ...(user ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : [])].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: isActive(link.to) ? '#818CF8' : 'var(--text-secondary)',
                    background: isActive(link.to) ? 'rgba(99,102,241,0.1)' : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}

              <div className="divider" style={{ marginBlock: '8px' }} />

              {user ? (
                <>
                  <Link to="/report" className="btn btn-primary btn-w-full" style={{ justifyContent: 'center' }}>
                    <PlusCircle size={15} />
                    Report Item
                  </Link>
                  <button onClick={handleSignOut} className="btn btn-ghost btn-w-full" style={{ justifyContent: 'center', marginTop: '6px' }}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="btn btn-primary btn-w-full" style={{ justifyContent: 'center' }}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu CSS via style tag — avoids Tailwind dependency */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          nav > div:last-child > a.btn, nav > div:last-child > div { display: none !important; }
          nav > div:nth-child(2) { display: none !important; }
        }
        .hidden { display: none !important; }
        @media (min-width: 640px) { .hidden.sm\\:inline { display: inline !important; } }
      `}</style>
    </>
  )
}
