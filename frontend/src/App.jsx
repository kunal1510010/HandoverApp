import { useEffect, useRef, useState } from 'react'
import { api, getToken, setToken } from './api'
import { carryForwardResponses, freshResponses } from './checklist'
import './App.css'

import Login from './screens/Login'
import Safety from './screens/Safety'
import NotReady from './screens/NotReady'
import Confirm from './screens/Confirm'
import Hub from './screens/Hub'
import Room from './screens/Room'
import Review from './screens/Review'
import Pdf from './screens/Pdf'
import Submitted from './screens/Submitted'
import IssueSheet from './screens/IssueSheet'

const DEFAULT_META = {
  inspector_name: '',
  inspector_contact: '',
  inspection_date: '',
  expected_resolution_date: '',
  fm_name: '',
}
const PENDING_KEY = 'asbl_pending_save'

const ROOM_PREFIX = '/room/'
const SCREEN_PATH = {
  login: '/login', notready: '/not-ready', safety: '/safety', confirm: '/confirm',
  hub: '/hub', review: '/review', pdf: '/pdf', submitted: '/submitted',
}
function screenPath(screen, roomKey) {
  if (screen === 'room') return ROOM_PREFIX + encodeURIComponent(roomKey || '')
  return SCREEN_PATH[screen] || '/'
}
function pathToScreen(pathname) {
  if (pathname.startsWith(ROOM_PREFIX)) return { screen: 'room', roomKey: decodeURIComponent(pathname.slice(ROOM_PREFIX.length)) }
  const entry = Object.entries(SCREEN_PATH).find(([, path]) => path === pathname)
  return { screen: entry ? entry[0] : null }
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [booting, setBooting] = useState(true)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [toast, setToastMsg] = useState('')

  const [cust, setCust] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')

  const [safety, setSafety] = useState({ helmet: false, vest: false, aware: false })
  const [safetyNext, setSafetyNext] = useState('confirm')

  const [unit, setUnit] = useState(null)
  const [checklist, setChecklist] = useState(null)
  const [inspectionId, setInspectionId] = useState(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSubmitted, setLastSubmitted] = useState(false)
  const [responses, setResponses] = useState({})
  const [meta, setMeta] = useState(DEFAULT_META)
  const [customerSigned, setCustomerSigned] = useState(false)
  const [inspectorSigned, setInspectorSigned] = useState(false)

  const [activeRoom, setActiveRoom] = useState(null)
  const [openCats, setOpenCats] = useState({})
  const [editItem, setEditItem] = useState(null)

  const [sheet, setSheet] = useState({ open: false, roomKey: null, itemId: null })
  const [draft, setDraft] = useState({
    heading: '', location: '', category: '', subcategory: '', checklistText: '', subLocation: '', photos: [],
  })
  const [sheetError, setSheetError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [pdfVariant, setPdfVariant] = useState('issues')
  const [reportUrl, setReportUrl] = useState('')

  function nav(screen, roomKey) {
    setScreen(screen)
    const path = screenPath(screen, roomKey)
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
  }

  const toastTimer = useRef(null)
  function toast_(msg) {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 1900)
  }

  // Track real connectivity; retry any save that failed while offline.
  useEffect(() => {
    const onOnline = () => { setOffline(false); flushPending() }
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  function flushPending() {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return
    const { id, payload } = JSON.parse(raw)
    api.patchInspection(id, payload)
      .then(() => localStorage.removeItem(PENDING_KEY))
      .catch(() => {})
  }

  // Bootstrap: resume a session if a token is already stored (re-open of the app).
  // Restores the screen the user was actually on (from the URL) instead of
  // always forcing the safety acknowledgement back up on every reload.
  useEffect(() => {
    const token = getToken()
    if (!token) { setBooting(false); return }
    const { screen: urlScreen, roomKey: urlRoomKey } = pathToScreen(window.location.pathname)
    api.getUnit()
      .then(async (u) => {
        setUnit(u)
        if (u.status === 'not_ready') { nav('notready'); return }
        const [cl, insp] = await Promise.all([api.getChecklist(), api.getInspection()])
        setChecklist(cl)
        applyInspection(insp)
        setSafetyNext('confirm')
        if (urlScreen === 'room') {
          const room = u.rooms.find((r) => r.key === urlRoomKey)
          if (room) { setActiveRoom(room.key); nav('room', room.key); return }
          nav('hub'); return
        }
        if (urlScreen && urlScreen !== 'login') { nav(urlScreen); return }
        nav('safety')
      })
      .catch(() => setToken(null))
      .finally(() => setBooting(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Back/forward navigation.
  useEffect(() => {
    function onPop() {
      const { screen: s, roomKey } = pathToScreen(window.location.pathname)
      if (!s || !unit) return
      if (s === 'room') {
        const room = unit.rooms.find((r) => r.key === roomKey)
        if (!room) return
        setActiveRoom(room.key); setOpenCats({})
      }
      setScreen(s)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [unit])

  function applyInspection(insp) {
    if (insp) {
      setInspectionId(insp.id)
      setHasDraft(insp.status === 'in_progress')
      setLastSubmitted(insp.status === 'submitted')
      if (insp.status === 'submitted') setReportUrl(`/api/inspection/${insp.id}/report.pdf`)
      setResponses(insp.responses)
      setMeta({
        inspector_name: insp.meta.inspector_name || '',
        inspector_contact: insp.meta.inspector_contact || '',
        inspection_date: insp.meta.inspection_date || '',
        expected_resolution_date: insp.meta.expected_resolution_date || '',
        fm_name: insp.meta.fm_name || '',
      })
      setCustomerSigned(insp.meta.customer_signed)
      setInspectorSigned(insp.meta.inspector_signed)
    } else {
      setInspectionId(null)
      setHasDraft(false)
      setLastSubmitted(false)
      setResponses({})
      setMeta(DEFAULT_META)
      setCustomerSigned(false)
      setInspectorSigned(false)
    }
  }

  // Debounced full-snapshot autosave whenever the draft changes (survives refresh).
  const saveTimer = useRef(null)
  const firstSave = useRef(true)
  useEffect(() => {
    if (!inspectionId) return
    if (firstSave.current) { firstSave.current = false; return }
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const payload = { responses, meta, customer_signed: customerSigned, inspector_signed: inspectorSigned }
      if (offline) {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ id: inspectionId, payload }))
        return
      }
      api.patchInspection(inspectionId, payload).catch(() => {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ id: inspectionId, payload }))
      })
    }, 800)
    return () => clearTimeout(saveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses, meta, customerSigned, inspectorSigned, inspectionId])

  // ---- auth ----
  function sendOtp() {
    const digits = (cust || '').replace(/\D/g, '')
    if (digits.length < 10) { setOtpError('Enter a valid 10-digit number.'); return }
    api.sendOtp(cust).then(() => { setOtpSent(true); setOtpError('') })
  }
  function verifyOtp() {
    api.verifyOtp(cust, otp)
      .then(async ({ token }) => {
        setToken(token)
        setOtpError('')
        const u = await api.getUnit()
        setUnit(u)
        if (u.status === 'not_ready') { nav('notready'); return }
        const [cl, insp] = await Promise.all([api.getChecklist(), api.getInspection()])
        setChecklist(cl)
        applyInspection(insp)
        setSafetyNext('confirm')
        setSafety({ helmet: false, vest: false, aware: false })
        nav('safety')
      })
      .catch((e) => setOtpError(e.message || 'Incorrect OTP.'))
  }
  function goDemo() {
    setSafetyNext('demo')
    setSafety({ helmet: false, vest: false, aware: false })
    nav('safety')
  }
  function goLogin() {
    setToken(null)
    nav('login')
    setOtpSent(false); setOtp(''); setCust(''); setOtpError('')
  }

  // ---- safety ----
  function safetyContinue() {
    if (!(safety.helmet && safety.vest && safety.aware)) { toast_('Acknowledge all items first'); return }
    if (safetyNext === 'demo') { goLogin(); toast_('Safety acknowledged · demo visit recorded'); return }
    nav('confirm')
  }

  // ---- confirm ----
  function beginInspection() {
    const fresh = lastSubmitted ? carryForwardResponses(unit.rooms, checklist, responses) : freshResponses(unit.rooms, checklist)
    api.createInspection({ responses: fresh, meta: DEFAULT_META }).then((insp) => {
      setInspectionId(insp.id)
      setHasDraft(true)
      setLastSubmitted(false)
      setResponses(insp.responses)
      setMeta(DEFAULT_META)
      setCustomerSigned(false)
      setInspectorSigned(false)
      nav('hub')
    })
  }

  // ---- responses ----
  function setResp(roomKey, itemId, resp) {
    setResponses((prev) => {
      const R = { ...prev, [roomKey]: { ...prev[roomKey] } }
      const cell = { ...R[roomKey][itemId], response: resp }
      if (resp !== 'ISSUE') cell.issues = []
      cell.skip_reason = resp === 'SKIPPED' ? 'Not accessible' : ''
      R[roomKey][itemId] = cell
      return R
    })
    setEditItem(null)
  }
  function deleteIssue(roomKey, itemId, index) {
    setResponses((prev) => {
      const R = { ...prev, [roomKey]: { ...prev[roomKey] } }
      const cell = { ...R[roomKey][itemId] }
      cell.issues = cell.issues.filter((_, i) => i !== index)
      if (!cell.issues.length) cell.response = 'VERIFIED'
      R[roomKey][itemId] = cell
      return R
    })
  }
  function toggleIssueFixed(roomKey, itemId, index) {
    setResponses((prev) => {
      const R = { ...prev, [roomKey]: { ...prev[roomKey] } }
      const cell = { ...R[roomKey][itemId] }
      cell.issues = cell.issues.map((iss, i) => i === index ? { ...iss, fixed: !iss.fixed } : iss)
      R[roomKey][itemId] = cell
      return R
    })
  }

  // ---- issue sheet ----
  function openSheet(roomKey, itemId) {
    const m = checklist.find((x) => x.id === itemId)
    const room = unit.rooms.find((r) => r.key === roomKey)
    setSheet({ open: true, roomKey, itemId })
    setSheetError('')
    setDraft({ heading: m.sub, location: '', category: m.cat, subcategory: m.sub, checklistText: m.text, subLocation: room.label, photos: [] })
  }
  function closeSheet() {
    setSheet({ open: false, roomKey: null, itemId: null })
    setSheetError('')
  }
  async function addPhoto(file) {
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const { id, url } = await api.uploadPhoto(compressed)
      setDraft((d) => ({ ...d, photos: [...d.photos, { id, url }] }))
    } catch {
      setSheetError('Photo upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }
  function removePhoto(index) {
    setDraft((d) => ({ ...d, photos: d.photos.filter((_, i) => i !== index) }))
  }
  function saveDraft(another) {
    if (draft.photos.length === 0) { setSheetError('Add at least one photo before saving.'); return }
    if (!draft.location.trim()) { setSheetError('Exact location is required.'); return }
    const { roomKey, itemId } = sheet
    setResponses((prev) => {
      const R = { ...prev, [roomKey]: { ...prev[roomKey] } }
      const cell = { ...R[roomKey][itemId] }
      cell.response = 'ISSUE'
      cell.issues = [...cell.issues, {
        heading: draft.heading || draft.subcategory,
        exact_location: draft.location,
        photos: draft.photos.map((p) => p.url),
      }]
      R[roomKey][itemId] = cell
      return R
    })
    toast_('Issue saved')
    if (another) {
      const m = checklist.find((x) => x.id === itemId)
      const room = unit.rooms.find((r) => r.key === roomKey)
      setDraft({ heading: m.sub, location: '', category: m.cat, subcategory: m.sub, checklistText: m.text, subLocation: room.label, photos: [] })
      setSheetError('')
    } else {
      closeSheet()
    }
  }

  // ---- review / pdf / submit ----
  function generateReport(totalIssues) {
    setPdfVariant(totalIssues > 0 ? 'issues' : 'zero')
    nav('pdf')
  }
  function finishReport() {
    api.submitInspection(inspectionId).then(({ report_url }) => {
      setReportUrl(report_url)
      setHasDraft(false)
      setLastSubmitted(true)
      nav('submitted')
      toast_('Report submitted')
    })
  }

  if (booting) return <div className="app-shell" />

  return (
    <div className="app-shell">
      {offline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#0D0D0D', color: '#fff', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
          <i className="ph ph-cloud-slash" style={{ fontSize: 15 }} />
          <span style={{ flex: 1 }}>Offline — saved locally, will sync</span>
        </div>
      )}

      {screen === 'login' && (
        <Login cust={cust} setCust={setCust} otp={otp} setOtp={setOtp} otpSent={otpSent} otpError={otpError}
          sendOtp={sendOtp} verifyOtp={verifyOtp} />
      )}
      {screen === 'notready' && <NotReady goLogin={goLogin} goDemo={goDemo} unitNo={unit ? unit.unit_no : ''} />}
      {screen === 'safety' && <Safety safety={safety} setSafety={setSafety} onBack={goLogin} onContinue={safetyContinue} />}
      {screen === 'confirm' && unit && (
        <Confirm unit={unit} hasDraft={hasDraft} lastSubmitted={lastSubmitted} reportUrl={reportUrl}
          checklist={checklist} responses={responses} onNotReady={() => nav('notready')}
          onResume={() => nav('hub')} onStart={beginInspection} onStartOver={beginInspection} />
      )}
      {screen === 'hub' && unit && (
        <Hub unit={unit} checklist={checklist} responses={responses} offline={offline}
          onOpenRoom={(key) => { setActiveRoom(key); setOpenCats({}); nav('room', key) }}
          onReview={() => nav('review')} />
      )}
      {screen === 'room' && unit && (
        <Room unit={unit} checklist={checklist} responses={responses} activeRoom={activeRoom}
          openCats={openCats} setOpenCats={setOpenCats} editItem={editItem} setEditItem={setEditItem}
          onBack={() => nav('hub')} setResp={setResp} onRaise={openSheet} onToggleFixed={toggleIssueFixed}
          onNextRoom={(key) => { setActiveRoom(key); setOpenCats({}); nav('room', key) }} />
      )}
      {screen === 'review' && unit && (
        <Review unit={unit} checklist={checklist} responses={responses} meta={meta} setMeta={setMeta}
          customerSigned={customerSigned} setCustomerSigned={setCustomerSigned}
          inspectorSigned={inspectorSigned} setInspectorSigned={setInspectorSigned}
          onBack={() => nav('hub')} onDeleteIssue={deleteIssue} onToggleFixed={toggleIssueFixed} onGenerate={generateReport} />
      )}
      {screen === 'pdf' && unit && (
        <Pdf unit={unit} checklist={checklist} responses={responses} meta={meta} pdfVariant={pdfVariant}
          customerSigned={customerSigned} inspectorSigned={inspectorSigned} inspectionId={inspectionId}
          onBack={() => nav('review')} onShare={() => toast_('Share link copied')} onFinish={finishReport} />
      )}
      {screen === 'submitted' && unit && (
        <Submitted unit={unit} checklist={checklist} responses={responses} meta={meta} reportUrl={reportUrl}
          onDone={() => nav('confirm')} />
      )}

      {sheet.open && (
        <IssueSheet draft={draft} sheetError={sheetError} uploading={uploading}
          onClose={closeSheet} onAddPhoto={addPhoto} onRemovePhoto={removePhoto}
          onHeadingChange={(v) => setDraft((d) => ({ ...d, heading: v }))}
          onLocationChange={(v) => setDraft((d) => ({ ...d, location: v }))}
          onSave={() => saveDraft(false)} onSaveAndAnother={() => saveDraft(true)} />
      )}

      {toast && (
        <div style={{ position: 'absolute', left: '50%', bottom: 78, transform: 'translateX(-50%)', zIndex: 30, background: '#0D0D0D', color: '#fff', fontSize: 13, fontWeight: 600, padding: '11px 18px', borderRadius: 12, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,.25)', animation: 'fade .2s ease' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// Resize/compress on <canvas> before upload — a few lines beats a dependency.
function compressImage(file, maxDim = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = url
  })
}
