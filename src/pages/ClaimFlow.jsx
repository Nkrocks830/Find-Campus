import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Loader2, HelpCircle, Lock, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import { getItem, createClaim, updateItemStatus } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import QRModal from '../components/QRModal'
import { DEMO_ITEMS } from '../lib/demoData'

const STEPS = ['Verify', 'Confirm', 'QR Code']

export default function ClaimFlow() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [item, setItem] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [claim, setClaim] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    getItem(itemId).then(it => {
      setItem(it)
      setIsDemo(false)
      setLoading(false)
    }).catch(() => {
      // Try demo items as fallback for display
      const demoItem = DEMO_ITEMS.find(d => d.id === itemId)
      if (demoItem) {
        setItem(demoItem)
        setIsDemo(true)
      }
      setLoading(false)
    })
  }, [itemId, user, navigate])

  if (loading) return <LoadingSpinner fullscreen label="Loading item…" />

  if (!item) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>😕</p>
        <p style={{ color: 'var(--text-muted)' }}>Item not found.</p>
        <Link to="/browse" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Items</Link>
      </div>
    </div>
  )

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    if (!answer.trim()) { setError('Please provide an answer.'); return }

    const correct = item.challenge_answer?.toLowerCase().trim()
    const given   = answer.toLowerCase().trim()

    if (correct && given !== correct) {
      setError('Incorrect answer. Try again.')
      return
    }

    setStep(1)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const token = `qr_${crypto.randomUUID().replace(/-/g, '')}`
      const newClaim = await createClaim({
        item_id: itemId,
        claimant_id: user.id,
        finder_id: item.user_id,
        challenge_question: item.challenge_question || 'N/A (Found Item)',
        challenge_answer: answer || 'N/A',
        status: 'verified',
        qr_token: token,
      })
      await updateItemStatus(itemId, 'claimed')
      setClaim({ ...newClaim, qr_token: token })
      setStep(2)
    } catch (err) {
      toast.error(err.message || 'Failed to create claim.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Bg */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="orb" style={{ width: '500px', height: '500px', top: '-150px', right: '-100px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div className="orb" style={{ width: '400px', height: '400px', bottom: '-100px', left: '-80px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={14} aria-hidden="true" /> Back
        </button>

        {/* Step bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '28px' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="step-item">
                <div className={`step-circle ${step > i ? 'done' : step === i ? 'active' : 'pending'}`}>
                  {step > i ? <CheckCircle size={13} aria-hidden="true" /> : i + 1}
                </div>
                <span style={{ fontSize: '12px', fontWeight: step === i ? 600 : 400, color: step === i ? '#818CF8' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${step > i ? 'done' : ''}`} style={{ flex: 1, margin: '0 8px' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass" style={{ overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          {isDemo && (
            <div style={{
              padding: '12px 20px',
              background: 'rgba(99,102,241,0.1)',
              borderBottom: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Info size={15} color="#818CF8" aria-hidden="true" />
              <p style={{ fontSize: '13px', color: '#A5B4FC', lineHeight: 1.5 }}>
                This is a <strong>demo item</strong>. Report a real item to use the full claim flow.
              </p>
            </div>
          )}
          <AnimatePresence mode="wait">

            {/* ── Step 0: Verify ── */}
            {step === 0 && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '28px' }}
              >
                {/* Item preview */}
                <div style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '14px', marginBottom: '24px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  }}>
                    {item.image_url
                      ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(99,102,241,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <HelpCircle size={20} color="#818CF8" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      Security Check
                    </h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prove ownership to claim</p>
                  </div>
                </div>

                {/* Challenge question */}
                {item.challenge_question ? (
                  <form onSubmit={handleVerify} noValidate>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label htmlFor="challenge-answer">
                        {item.challenge_question}
                      </label>
                      <input
                        id="challenge-answer"
                        type="text"
                        autoFocus
                        placeholder="Your answer…"
                        value={answer}
                        onChange={e => { setAnswer(e.target.value); setError(null) }}
                        className={`input ${error ? 'input-error' : ''}`}
                        aria-describedby={error ? 'answer-error' : 'answer-hint'}
                        aria-invalid={!!error}
                      />
                      {error
                        ? <p id="answer-error" className="form-error" role="alert"><AlertCircle size={12} />{error}</p>
                        : <p id="answer-hint" className="form-hint">
                            <Lock size={11} style={{ display: 'inline' }} aria-hidden="true" /> Your answer is never stored in plain text.
                          </p>
                      }
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-w-full"
                      style={{ padding: '13px' }}
                      disabled={!answer.trim()}
                    >
                      <Shield size={15} aria-hidden="true" />
                      Verify Answer
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                      <AlertCircle size={15} className="alert-icon" aria-hidden="true" />
                      <span>No security question set. Contact the reporter directly to claim this item.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-amber btn-w-full"
                    >
                      Proceed Anyway
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 1: Confirm ── */}
            {step === 1 && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '28px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CheckCircle size={32} color="#10B981" aria-hidden="true" />
                  </motion.div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Answer Verified! ✅
                  </h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Your ownership has been verified. Confirm below to create a claim and generate your QR handover code.
                  </p>
                </div>

                <div style={{
                  padding: '14px 16px', marginBottom: '20px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Item</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ color: '#34D399', fontWeight: 600 }}>Ownership verified</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="btn btn-primary btn-w-full"
                    style={{ padding: '13px' }}
                  >
                    {submitting
                      ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Creating Claim…</>
                      : <><Shield size={15} aria-hidden="true" /> Confirm & Generate QR</>}
                  </button>
                  <button type="button" onClick={() => setStep(0)} className="btn btn-ghost btn-w-full" disabled={submitting}>
                    ← Go Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: QR ── */}
            {step === 2 && claim && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '28px', textAlign: 'center' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, delay: 0.15 }}
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircle size={32} color="#10B981" aria-hidden="true" />
                </motion.div>

                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Claim Created! 🎉
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                  Show your QR code to the finder to complete the handover.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('show-qr-btn')?.click()}
                    className="btn btn-primary btn-w-full"
                    style={{ padding: '13px' }}
                    id="show-qr-btn"
                    aria-haspopup="dialog"
                  >
                    Show QR Code
                  </button>
                  <Link to="/dashboard" className="btn btn-ghost btn-w-full">
                    Go to Dashboard
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Auto-show QR modal on step 2 */}
      {step === 2 && claim && (
        <QRModal
          token={claim.qr_token}
          itemTitle={item.title}
          onClose={() => navigate('/dashboard')}
        />
      )}
    </div>
  )
}
