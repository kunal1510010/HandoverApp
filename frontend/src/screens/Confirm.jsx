import { roomStat } from '../checklist'

export default function Confirm({ unit, hasDraft, checklist, responses, onResume, onStart, onStartOver }) {
  const rows = [
    { k: 'Customer', v: unit.customer_name },
    { k: 'Configuration', v: unit.config },
    { k: 'Carpet area', v: `${unit.sqft} sq.ft` },
    { k: 'Product', v: unit.product },
  ]
  let overallPct = 0
  if (hasDraft && checklist) {
    let done = 0, total = 0
    unit.rooms.forEach((r) => {
      const s = roomStat(r, checklist, responses)
      done += s.done; total += s.total
    })
    overallPct = total ? Math.round((done / total) * 100) : 0
  }

  return (
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: 24, animation: 'fade .25s ease' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7A99', marginBottom: 6 }}>Is this the right unit?</div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 20 }}>Confirm before you start</div>
      <div style={{ background: '#fff', border: '1px solid #E6E8EC', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ background: '#141B2D', padding: '20px 22px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.01em' }}>{unit.unit_no}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(31,169,113,.18)', color: '#5FE3A9', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 9999 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#5FE3A9' }} />HANDOVER READY
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#B7C0D4', marginTop: 4 }}>{unit.project} · Tower {unit.tower}</div>
        </div>
        <div style={{ padding: '6px 22px 10px' }}>
          {rows.map((r) => (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F0F1F3' }}>
              <span style={{ fontSize: 13, color: '#6B7A99' }}>{r.k}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#141B2D' }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 14px', background: '#EAF6F0', borderRadius: 12 }}>
        <i className="ph-fill ph-info" style={{ color: '#1FA971', fontSize: 18 }} />
        <span style={{ fontSize: 12, color: '#0E7A52', lineHeight: 1.4 }}>Rooms and sizes auto-loaded from unit config.</span>
      </div>
      <div style={{ flex: 1 }} />
      {hasDraft ? (
        <>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={onResume}>
            <i className="ph ph-arrow-counter-clockwise" />Resume inspection · {overallPct}%
          </button>
          <button className="btn-secondary" style={{ marginTop: 10 }} onClick={onStartOver}>Start over</button>
        </>
      ) : (
        <button className="btn-primary" style={{ marginTop: 20 }} onClick={onStart}>
          <i className="ph ph-play" />Start Inspection
        </button>
      )}
    </div>
  )
}
