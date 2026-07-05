import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Loader2, CheckCircle, KeyRound, User } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user, signIn, signUp } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim() || (isSignUp && !name.trim())) return
    setLoading(true)
    try {
      if (isSignUp) {
        const { session } = await signUp(email.trim().toLowerCase(), password, name.trim())
        if (!session) {
          toast.success('Account created! Please check your email to confirm.')
          setIsSignUp(false) // switch to sign in view
        } else {
          toast.success('Account created successfully!')
          setSuccess(true)
          setTimeout(() => navigate('/dashboard'), 1200)
        }
      } else {
        await signIn(email.trim().toLowerCase(), password)
        toast.success('Signed in successfully!')
        setSuccess(true)
        setTimeout(() => navigate('/dashboard'), 1200)
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="orb" style={{ width: '500px', height: '500px', top: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)' }} />
        <div className="orb" style={{ width: '400px', height: '400px', bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '20px', fontWeight: 800, color: 'white',
            boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
          }}>F</div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-secondary)' }}>
            Findit<span style={{ color: '#818CF8' }}>Campus</span>
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center', padding: '16px 0' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <CheckCircle size={32} color="#10B981" aria-hidden="true" />
                </motion.div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  You're in! 🎉
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Redirecting to your dashboard…
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ marginBottom: '28px' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {isSignUp ? 'Create Account 👋' : 'Welcome back 👋'}
                  </h1>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {isSignUp ? 'Sign up to start finding and reporting items.' : 'Sign in to your account with your email and password.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {isSignUp && (
                    <div className="form-field" style={{ marginBottom: '16px' }}>
                      <label htmlFor="name-input">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} className="input-icon-left" style={{ top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
                        <input
                          id="name-input"
                          type="text"
                          autoComplete="name"
                          required={isSignUp}
                          placeholder="Arjun Sharma"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="input has-icon-left"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-field" style={{ marginBottom: '16px' }}>
                    <label htmlFor="email-input">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} className="input-icon-left" style={{ top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
                      <input
                        id="email-input"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        placeholder="you@college.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input has-icon-left"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginBottom: '24px' }}>
                    <label htmlFor="password-input">Password</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} className="input-icon-left" style={{ top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
                      <input
                        id="password-input"
                        type="password"
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input has-icon-left"
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-w-full"
                    style={{ padding: '13px', fontSize: 'var(--text-base)', marginBottom: '16px' }}
                    disabled={loading || !email.trim() || !password.trim() || (isSignUp && !name.trim())}
                  >
                    {loading
                      ? <><Loader2 size={17} className="animate-spin" aria-hidden="true" /> {isSignUp ? 'Creating...' : 'Signing in...'}</>
                      : <>{isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={17} aria-hidden="true" /></>}
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'inherit', fontWeight: 600 }}
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </button>
                </p>
                <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', lineHeight: 1.6, marginTop: '16px' }}>
                  <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>← Back to home</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
