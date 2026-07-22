export default function NotReady({ goLogin, goDemo, unitNo }) {
  return (
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: 24, animation: 'fade .25s ease' }}>
      <div onClick={goLogin} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7A99', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 22 }}>
        <i className="ph ph-arrow-left" />Back
      </div>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FEECEC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <i className="ph-fill ph-clock-countdown" style={{ fontSize: 34, color: '#D93F2B' }} />
      </div>
      <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8 }}>Flat not ready yet</div>
      <div style={{ fontSize: 14, color: '#6B7A99', lineHeight: 1.55, marginBottom: 22 }}>
        Unit <b style={{ color: '#141B2D' }}>{unitNo || 'this unit'}</b> is not marked <b style={{ color: '#141B2D' }}>Handover Ready</b>. Inspection can't start until QC clears it. No data is lost — you can come back to this link.
      </div>
      <div style={{ background: '#fff', border: '1px solid #E6E8EC', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#141B2D', marginBottom: 6 }}>In the meantime</div>
        <div style={{ fontSize: 13, color: '#6B7A99', lineHeight: 1.5 }}>Visit the demo flat to preview finishes and layout. We'll record your visit.</div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn-primary" onClick={goDemo}>Visit demo flat</button>
      <button className="btn-secondary" style={{ marginTop: 10 }} onClick={goLogin}>Notify me when ready</button>
    </div>
  )
}
