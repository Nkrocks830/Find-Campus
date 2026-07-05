import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, X, MapPin, AlertCircle, Check,
  Loader2, ChevronRight, ChevronLeft, Image, Lock,
  Search, Eye, Calendar, Phone, MapPinned, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import { createItem, uploadImage } from '../lib/supabase'
import { getTextEmbedding } from '../lib/huggingface'
import { computeAndStoreMatches } from '../lib/matching'
import CategoryAutoTag from '../components/CategoryAutoTag'
import LocationPicker from '../components/LocationPicker'

/* ── Step definitions differ based on type ───────────────────── */
const LOST_STEPS = [
  { id: 1, label: 'What Did You Lose?', icon: '🔍' },
  { id: 2, label: 'Where & When?', icon: '📍' },
  { id: 3, label: 'Verify Ownership', icon: '🔐' },
]

const FOUND_STEPS = [
  { id: 1, label: 'What Did You Find?', icon: '✅' },
  { id: 2, label: 'Location & Photo', icon: '📷' },
  { id: 3, label: 'Handover Details', icon: '🤝' },
]

export default function ReportItem() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    type: params.get('type') === 'found' ? 'found' : 'lost',
    title: '',
    description: '',
    category: 'other',
    locationName: '',
    locationLat: null,
    locationLng: null,
    // Lost-specific
    challengeQuestion: '',
    challengeAnswer: '',
    dateOccurred: '',
    // Found-specific
    collectionPoint: '',
    contactPreference: 'app',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!user) navigate('/auth', { replace: true })
  }, [user, navigate])

  const isLost = form.type === 'lost'
  const STEPS = isLost ? LOST_STEPS : FOUND_STEPS

  // Dropzone
  const onDrop = useCallback((accepted) => {
    const file = accepted[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDropRejected: () => toast.error('File too large or unsupported format (max 5 MB)'),
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validateStep = (s) => {
    const e = {}
    if (s === 1) {
      if (!form.title.trim()) e.title = 'Item title is required'
      if (!form.description.trim()) e.description = 'Description is required'
      if (form.description.trim().length < 10) e.description = 'Add at least 10 characters to help with matching'
    }
    if (s === 3) {
      if (isLost) {
        if (!form.challengeQuestion.trim()) e.challengeQuestion = 'Add a security question'
        if (!form.challengeAnswer.trim()) e.challengeAnswer = 'Add the answer'
      } else {
        if (!form.collectionPoint.trim()) e.collectionPoint = 'Please specify where to collect'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (!validateStep(step)) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const prevStep = () => { setStep(s => s - 1); setErrors({}) }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitting(true)

    try {
      // Upload image
      let imageUrl = null
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name}`
        imageUrl = await uploadImage(imageFile, path)
      }

      // Get embedding
      let embedding = null
      try {
        const text = `${form.title} ${form.description} ${form.category}`
        embedding = await getTextEmbedding(text)
      } catch { /* non-fatal */ }

      // Build item data
      const itemData = {
        user_id: user.id,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        image_url: imageUrl,
        embedding,
        location_lat: form.locationLat,
        location_lng: form.locationLng,
        location_name: form.locationName.trim() || null,
        status: 'active',
      }

      // Type-specific fields
      if (isLost) {
        itemData.challenge_question = form.challengeQuestion.trim()
        itemData.challenge_answer = form.challengeAnswer.trim().toLowerCase()
        if (form.dateOccurred) itemData.date_occurred = new Date(form.dateOccurred).toISOString()
      } else {
        itemData.collection_point = form.collectionPoint.trim()
        itemData.contact_preference = form.contactPreference
      }

      // Create item
      const item = await createItem(itemData)

      // Compute AI matches in background
      if (embedding) computeAndStoreMatches(item, embedding).catch(() => {})

      toast.success(`${isLost ? 'Lost' : 'Found'} item reported successfully!`)
      navigate(`/item/${item.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to submit. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const typeColor = isLost ? '#FCA5A5' : '#6EE7B7'
  const typeBg    = isLost ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'
  const typeBdr   = isLost ? 'rgba(239,68,68,0.2)'  : 'rgba(16,185,129,0.2)'

  return (
    <div className="page-wrapper">
      <div className="container-sm">

        {/* ── Header ── */}
        <div style={{ marginBottom: '36px' }}>
          <motion.h1
            className="text-h1"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: 'var(--text-primary)', marginBottom: '8px' }}
          >
            {isLost ? '🔍 Report a Lost Item' : '✅ Report a Found Item'}
          </motion.h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {isLost
              ? 'Describe what you lost so our AI can match it with found items on campus.'
              : 'Describe what you found so the owner can locate and claim it.'}
          </p>
        </div>

        {/* ── Type toggle ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          {['lost', 'found'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { set('type', t); setStep(1); setErrors({}) }}
              style={{
                flex: 1, padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms',
                background: form.type === t ? typeBg : 'var(--bg-elevated)',
                border: `1px solid ${form.type === t ? typeBdr : 'var(--border-default)'}`,
                color: form.type === t ? typeColor : 'var(--text-muted)',
              }}
              aria-pressed={form.type === t}
            >
              {t === 'lost' ? '🔍 I lost something' : '✅ I found something'}
            </button>
          ))}
        </div>

        {/* ── Step indicator ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="step-item">
                <div className={`step-circle ${step > s.id ? 'done' : step === s.id ? 'active' : 'pending'}`}>
                  {step > s.id ? <Check size={13} aria-hidden="true" /> : s.id}
                </div>
                <span style={{ fontSize: '12px', fontWeight: step === s.id ? 600 : 400, color: step === s.id ? '#818CF8' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${step > s.id ? 'done' : ''}`} style={{ margin: '0 8px', flex: 1 }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════
                STEP 1 — Item Details (shared but with different hints)
               ══════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {/* Title */}
                <div className="form-field">
                  <label htmlFor="item-title">
                    {isLost ? <><Search size={13} style={{ display: 'inline', marginRight: '5px' }} />What did you lose? *</> : <><Eye size={13} style={{ display: 'inline', marginRight: '5px' }} />What did you find? *</>}
                  </label>
                  <input
                    id="item-title"
                    type="text"
                    placeholder={isLost ? 'e.g. Blue Hydro Flask Water Bottle' : 'e.g. Black Samsung Galaxy Buds in case'}
                    value={form.title}
                    onChange={e => { set('title', e.target.value); setErrors(er => ({ ...er, title: null })) }}
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    maxLength={100}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    aria-invalid={!!errors.title}
                  />
                  {errors.title && <p id="title-error" className="form-error"><AlertCircle size={12} />{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="form-field">
                  <label htmlFor="item-desc">
                    Description *
                    <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-disabled)', fontWeight: 400 }}>
                      ({form.description.length} chars — more detail = better AI matches)
                    </span>
                  </label>
                  <textarea
                    id="item-desc"
                    placeholder={isLost
                      ? 'Describe color, brand, size, unique markings, stickers, scratches...'
                      : 'Describe the item\'s current condition, color, brand, any distinguishing marks...'}
                    value={form.description}
                    onChange={e => { set('description', e.target.value); setErrors(er => ({ ...er, description: null })) }}
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    rows={4}
                    aria-describedby={errors.description ? 'desc-error' : 'desc-hint'}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description
                    ? <p id="desc-error" className="form-error"><AlertCircle size={12} />{errors.description}</p>
                    : <p id="desc-hint" className="form-hint">
                        {isLost
                          ? 'Include unique identifiers (stickers, engravings, scratches) so our AI can find your item.'
                          : 'Be specific about what you found — the AI uses this to match with lost item reports.'}
                      </p>
                  }
                </div>

                {/* Category */}
                <div className="form-field">
                  <label>Category</label>
                  <CategoryAutoTag
                    description={form.description}
                    value={form.category}
                    onChange={val => set('category', val)}
                  />
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                STEP 2 — Location & Photo / When
               ══════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {/* Location name */}
                <div className="form-field">
                  <label htmlFor="location-name">
                    <MapPin size={13} style={{ display: 'inline', marginRight: '5px' }} aria-hidden="true" />
                    {isLost ? 'Where did you last have it?' : 'Where did you find it?'}
                  </label>
                  <input
                    id="location-name"
                    type="text"
                    placeholder="e.g. Main Library, Block C Canteen, Hostel A..."
                    value={form.locationName}
                    onChange={e => set('locationName', e.target.value)}
                    className="input"
                  />
                </div>

                {/* Date/time — LOST only */}
                {isLost && (
                  <div className="form-field">
                    <label htmlFor="date-occurred">
                      <Calendar size={13} style={{ display: 'inline', marginRight: '5px' }} aria-hidden="true" />
                      When did you lose it? <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      id="date-occurred"
                      type="datetime-local"
                      value={form.dateOccurred}
                      onChange={e => set('dateOccurred', e.target.value)}
                      className="input"
                      max={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="form-hint">Helps narrow down the search window.</p>
                  </div>
                )}

                {/* Map picker */}
                <div className="form-field">
                  <label>Pin on Map <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(optional)</span></label>
                  <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                    <LocationPicker
                      value={{ lat: form.locationLat, lng: form.locationLng, name: form.locationName }}
                      onChange={({ lat, lng, name }) => { 
                        set('locationLat', lat)
                        set('locationLng', lng)
                        if (name && name !== 'Custom Location') set('locationName', name)
                      }}
                    />
                  </div>
                  {form.locationLat && (
                    <p className="form-hint" style={{ color: '#34D399' }}>
                      ✓ Pinned at {form.locationLat.toFixed(5)}, {form.locationLng.toFixed(5)}
                    </p>
                  )}
                </div>

                {/* Photo upload */}
                <div className="form-field">
                  <label>
                    <Camera size={13} style={{ display: 'inline', marginRight: '5px' }} aria-hidden="true" />
                    Photo
                    {isLost
                      ? <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}> (optional)</span>
                      : <span style={{ color: '#6EE7B7', fontWeight: 500 }}> (recommended — you have the item!)</span>}
                  </label>
                  {imagePreview ? (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                        aria-label="Remove photo"
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: 'rgba(7,8,15,0.75)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload photo — drag and drop or click"
                      style={{
                        padding: '32px 20px',
                        border: `2px dashed ${isDragActive ? 'rgba(99,102,241,0.6)' : isLost ? 'var(--border-default)' : 'rgba(16,185,129,0.3)'}`,
                        borderRadius: 'var(--radius-lg)',
                        background: isDragActive ? 'rgba(79,70,229,0.05)' : isLost ? 'var(--bg-elevated)' : 'rgba(16,185,129,0.03)',
                        textAlign: 'center', cursor: 'pointer',
                        transition: 'all 200ms',
                      }}
                    >
                      <input {...getInputProps()} aria-label="Photo file input" />
                      <Upload size={28} color={isLost ? 'var(--text-disabled)' : '#6EE7B7'} style={{ margin: '0 auto 10px' }} aria-hidden="true" />
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {isDragActive ? 'Drop it here!' : isLost ? 'Drag & drop or click to upload' : '📸 Snap a photo of the item you found!'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-disabled)', marginTop: '4px' }}>
                        JPG, PNG, WebP · Max 5 MB
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                STEP 3 — LOST: Security Q&A | FOUND: Handover Details
               ══════════════════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {isLost ? (
                  /* ── LOST: Security Question ─────────────────── */
                  <>
                    <div className="alert alert-info">
                      <Lock size={15} className="alert-icon" aria-hidden="true" />
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '2px' }}>Fraud prevention</p>
                        <p>Set a question only the real owner would know. When someone tries to claim your item, they'll need to answer this correctly.</p>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="challenge-q">Security Question *</label>
                      <input
                        id="challenge-q"
                        type="text"
                        placeholder="e.g. What sticker is on the bottle?"
                        value={form.challengeQuestion}
                        onChange={e => { set('challengeQuestion', e.target.value); setErrors(er => ({ ...er, challengeQuestion: null })) }}
                        className={`input ${errors.challengeQuestion ? 'input-error' : ''}`}
                        aria-describedby={errors.challengeQuestion ? 'cq-error' : 'cq-hint'}
                        aria-invalid={!!errors.challengeQuestion}
                      />
                      {errors.challengeQuestion
                        ? <p id="cq-error" className="form-error"><AlertCircle size={12} />{errors.challengeQuestion}</p>
                        : <p id="cq-hint" className="form-hint">Ask something only the owner would know.</p>
                      }
                    </div>

                    <div className="form-field">
                      <label htmlFor="challenge-a">Secret Answer *</label>
                      <input
                        id="challenge-a"
                        type="text"
                        placeholder="e.g. mountain sticker and smiley face"
                        value={form.challengeAnswer}
                        onChange={e => { set('challengeAnswer', e.target.value); setErrors(er => ({ ...er, challengeAnswer: null })) }}
                        className={`input ${errors.challengeAnswer ? 'input-error' : ''}`}
                        aria-describedby={errors.challengeAnswer ? 'ca-error' : 'ca-hint'}
                        aria-invalid={!!errors.challengeAnswer}
                      />
                      {errors.challengeAnswer
                        ? <p id="ca-error" className="form-error"><AlertCircle size={12} />{errors.challengeAnswer}</p>
                        : <p id="ca-hint" className="form-hint">Case-insensitive. Shown only after correct answer is submitted.</p>
                      }
                    </div>
                  </>
                ) : (
                  /* ── FOUND: Handover Details ─────────────────── */
                  <>
                    <div className="alert alert-info" style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)' }}>
                      <MapPinned size={15} className="alert-icon" style={{ color: '#6EE7B7' }} aria-hidden="true" />
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '2px' }}>Help the owner find you</p>
                        <p>Let them know where to collect the item and how to reach you.</p>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="collection-point">Collection Point *</label>
                      <input
                        id="collection-point"
                        type="text"
                        placeholder="e.g. Security cabin near Main Gate, CS Dept office Room 102..."
                        value={form.collectionPoint}
                        onChange={e => { set('collectionPoint', e.target.value); setErrors(er => ({ ...er, collectionPoint: null })) }}
                        className={`input ${errors.collectionPoint ? 'input-error' : ''}`}
                        aria-describedby={errors.collectionPoint ? 'cp-error' : 'cp-hint'}
                        aria-invalid={!!errors.collectionPoint}
                      />
                      {errors.collectionPoint
                        ? <p id="cp-error" className="form-error"><AlertCircle size={12} />{errors.collectionPoint}</p>
                        : <p id="cp-hint" className="form-hint">Where can the owner come to pick this up?</p>
                      }
                    </div>

                    <div className="form-field">
                      <label>
                        <Phone size={13} style={{ display: 'inline', marginRight: '5px' }} aria-hidden="true" />
                        How should the owner contact you?
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { value: 'app',   label: '💬 Through this app', desc: 'Claim flow + QR handover' },
                          { value: 'email', label: '📧 Email me',         desc: 'Show my email on the listing' },
                          { value: 'both',  label: '🔗 Both',             desc: 'App claim + email visible' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => set('contactPreference', opt.value)}
                            style={{
                              flex: 1, minWidth: '120px', padding: '12px',
                              borderRadius: 'var(--radius-md)',
                              background: form.contactPreference === opt.value ? 'rgba(16,185,129,0.08)' : 'var(--bg-elevated)',
                              border: `1px solid ${form.contactPreference === opt.value ? 'rgba(16,185,129,0.3)' : 'var(--border-default)'}`,
                              color: form.contactPreference === opt.value ? '#6EE7B7' : 'var(--text-muted)',
                              cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                              transition: 'all 200ms',
                            }}
                            aria-pressed={form.contactPreference === opt.value}
                          >
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>{opt.label}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Summary preview */}
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Summary
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Type</span>
                    <span className={`badge badge-${form.type}`}>{isLost ? '🔍 Lost' : '✅ Found'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Title</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{form.title || '—'}</span>
                  </div>
                  {form.locationName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Location</span>
                      <span style={{ color: 'var(--text-primary)' }}>{form.locationName}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Photo</span>
                    <span style={{ color: imageFile ? '#34D399' : 'var(--text-disabled)' }}>
                      {imageFile ? '✓ Attached' : 'None'}
                    </span>
                  </div>
                  {!isLost && form.collectionPoint && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Collect at</span>
                      <span style={{ color: 'var(--text-primary)' }}>{form.collectionPoint}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation buttons ── */}
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'space-between', gap: '12px',
          }}>
            <button
              type="button"
              onClick={step === 1 ? () => navigate(-1) : prevStep}
              className="btn btn-ghost"
              disabled={submitting}
            >
              <ChevronLeft size={15} aria-hidden="true" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Next
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting}
                aria-label="Submit item report"
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Submitting…</>
                  : <><Check size={15} aria-hidden="true" /> {isLost ? 'Submit Lost Report' : 'Submit Found Report'}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
