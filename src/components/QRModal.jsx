import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Shield, CheckCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect } from 'react'

export default function QRModal({ token, itemTitle, onClose }) {
  const url = `${window.location.origin}/verify/${token}`

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `findit-${token.slice(0, 8)}.svg` })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`QR handover proof for ${itemTitle}`}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          background: 'rgba(7,8,15,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '400px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 20px 16px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                background: 'rgba(16,185,129,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Shield size={20} color="#10B981" aria-hidden="true" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  Handover QR Code
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Verified claim proof</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close QR modal"
              className="btn btn-ghost btn-icon btn-sm"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* QR Code */}
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Status bar */}
            <div className="alert alert-success" style={{ width: '100%' }}>
              <CheckCircle size={15} className="alert-icon" aria-hidden="true" />
              <span style={{ fontSize: '13px' }}>
                <strong>{itemTitle}</strong> ownership verified
              </span>
            </div>

            {/* QR Container */}
            <div style={{
              padding: '20px',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}>
              <QRCodeSVG
                id="qr-code-svg"
                value={url}
                size={200}
                bgColor="#ffffff"
                fgColor="#07080F"
                level="H"
                includeMargin={false}
                aria-label={`QR code for item verification: ${token}`}
              />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: '300px' }}>
              Show this QR to the finder to complete the handover. It encodes a unique verification token.
            </p>

            {/* Token */}
            <div style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {token}
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(token) }}
                style={{
                  flexShrink: 0, fontSize: '11px', padding: '3px 8px',
                  borderRadius: '5px',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', gap: '10px',
          }}>
            <button
              onClick={handleDownload}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              <Download size={14} aria-hidden="true" />
              Download
            </button>
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
