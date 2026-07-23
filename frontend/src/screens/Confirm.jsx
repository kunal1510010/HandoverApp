import { useState } from 'react'
import { roomStat } from '../checklist'
import FloorPlanModal from './FloorPlanModal'

const STATUS_META = {
  handover_ready: { label: 'HANDOVER READY', fg: '#5FE3A9', bg: 'rgba(31,169,113,.18)' },
  handed_over: { label: 'HANDED OVER', fg: '#5FE3A9', bg: 'rgba(31,169,113,.18)' },
  issues: { label: 'ISSUES RAISED', fg: '#FF9C8A', bg: 'rgba(240,78,56,.18)' },
  not_ready: { label: 'NOT READY', fg: '#F6C177', bg: 'rgba(234,122,30,.18)' },
}

export default function Confirm({ unit, hasDraft, lastSubmitted, reportUrl, checklist, responses, onResume, onStart, onStartOver, onNotReady }) {
  const [zoomOpen, setZoomOpen] = useState(false)
  const statusMeta = STATUS_META[unit.status] || STATUS_META.handover_ready
  const canReinspect = unit.status === 'issues'
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
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: 18, animation: 'fade .25s ease' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#667085', marginBottom: 4 }}>Is this the right unit?</div>
      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 14 }}>Confirm before you start</div>
      <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ background: '#0D0D0D', padding: '14px 18px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.01em' }}>{unit.unit_no}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: statusMeta.bg, color: statusMeta.fg, fontSize: 10, fontWeight: 700, padding: '4px 9px', borderRadius: 9999 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: statusMeta.fg }} />{statusMeta.label}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#B7C0D4', marginTop: 3 }}>{unit.project} · Tower {unit.tower}</div>
        </div>
        <div style={{ padding: '2px 18px 4px' }}>
          {rows.map((r, i) => (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < rows.length - 1 ? '1px solid #EAECF0' : 'none' }}>
              <span style={{ fontSize: 12, color: '#667085' }}>{r.k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D' }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      {unit.floor_plan && (
        <div onClick={() => setZoomOpen(true)}
          style={{ marginTop: 12, background: '#fff', border: '1px solid #EAECF0', borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in' }}>
          <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#667085', borderBottom: '1px solid #EAECF0' }}>Floor plan · tap to zoom</div>
          <div style={{ display: 'flex', justifyContent: 'center', background: '#FAFAFB' }}>
            <img src={unit.floor_plan} alt="Floor plan" style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, padding: '10px 12px', background: '#EAF6F0', borderRadius: 12 }}>
        <i className="ph-fill ph-info" style={{ color: '#1FA971', fontSize: 16 }} />
        <span style={{ fontSize: 11, color: '#0E7A52', lineHeight: 1.4 }}>Rooms and sizes auto-loaded from unit config.</span>
      </div>
      <div style={{ flex: 1, minHeight: 12 }} />
      {zoomOpen && <FloorPlanModal src={unit.floor_plan} onClose={() => setZoomOpen(false)} />}
      {lastSubmitted ? (
        <>
          {canReinspect && (
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={onStart}>
              <i className="ph ph-arrow-clockwise" />Initiate re-inspection
            </button>
          )}
          <a href={reportUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginTop: canReinspect ? 8 : 14, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <i className="ph ph-file-text" />Download report
          </a>
        </>
      ) : hasDraft ? (
        <>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={onResume}>
            <i className="ph ph-arrow-counter-clockwise" />Resume inspection · {overallPct}%
          </button>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={onStartOver}>Start over</button>
        </>
      ) : (
        <button className="btn-primary" style={{ marginTop: 14 }} onClick={onStart}>
          <i className="ph ph-play" />Start Inspection
        </button>
      )}
      <div onClick={onNotReady} style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#667085', cursor: 'pointer' }}>
        Flat not actually ready? <span style={{ color: '#F04E38', fontWeight: 600 }}>See options</span>
      </div>
    </div>
  )
}
