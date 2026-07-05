export default function LoadingSpinner({ size = 'md', label, fullscreen = false }) {
  const dim = size === 'sm' ? 20 : size === 'lg' ? 40 : 28

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        role="status"
        aria-label={label || 'Loading'}
        style={{
          width: dim, height: dim,
          border: `2px solid rgba(99,102,241,0.15)`,
          borderTopColor: '#6366F1',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {label && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100dvh - 64px)',
      }}>
        {spinner}
      </div>
    )
  }

  return spinner
}
