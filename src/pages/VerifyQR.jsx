import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ShieldAlert, ArrowLeft, Loader2, PackageCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import { getClaimByToken, updateItemStatus } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function VerifyQR() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    
    getClaimByToken(token).then(c => {
      if (!c) {
        setError('Invalid QR Code. This claim does not exist or has been deleted.')
      } else if (c.finder_id !== user.id) {
        setError('Unauthorized. Only the person who found this item can verify this QR code.')
      } else {
        setClaim(c)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.message || 'Failed to verify QR token.')
      setLoading(false)
    })
  }, [token, user, navigate])

  const handleCompleteHandover = async () => {
    setSubmitting(true)
    try {
      await updateItemStatus(claim.item_id, 'claimed')
      setSuccess(true)
      toast.success('Handover completed successfully!')
    } catch (err) {
      toast.error('Failed to complete handover. ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner fullscreen label="Verifying QR Token…" />

  if (error) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card" style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#EF4444'
          }}>
            <ShieldAlert size={32} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Verification Failed</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>{error}</p>
          <Link to="/" className="btn btn-secondary btn-w-full">Return Home</Link>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px', textAlign: 'center' }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10B981'
          }}>
            <CheckCircle size={40} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Handover Complete!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '32px', lineHeight: 1.6 }}>
            You have successfully verified {claim.claimant?.name?.split(' ')[0]}'s QR code and handed over the {claim.item?.title}. The item has been marked as officially claimed. Thank you for making the campus a better place!
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-w-full">View Dashboard</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" style={{ maxWidth: '440px', width: '100%', overflow: 'hidden' }}
      >
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(16,185,129,0.05)'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981'
          }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>Valid QR Code</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>Verify details to complete handover</p>
          </div>
        </div>

        <div style={{ padding: '28px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Item Details
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                overflow: 'hidden', flexShrink: 0
              }}>
                {claim.item?.image_url ? (
                  <img src={claim.item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)' }}>
                    <PackageCheck size={20} />
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {claim.item?.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {claim.item?.location_name || claim.item?.category}
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Claimant Profile
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8' }}>
                <User size={20} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{claim.claimant?.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-disabled)', marginTop: '2px' }}>{claim.claimant?.email}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost" disabled={submitting}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompleteHandover}
              className="btn btn-primary"
              style={{ flex: 1, background: '#10B981', color: '#000' }}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Verifying…</>
              ) : (
                <><CheckCircle size={16} /> Complete Handover</>
              )}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
