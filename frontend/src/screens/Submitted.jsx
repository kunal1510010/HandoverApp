import { roomStat } from '../checklist'
import asblLogo from '../assets/Nav-black-logo.svg'

export default function Submitted({ unit, checklist, responses, meta, reportUrl, onDone }) {
  const rooms = unit.rooms
  const totalIssues = rooms.reduce((a, r) => a + roomStat(r, checklist, responses).issues, 0)
  const issued = totalIssues > 0

  const summary = [
    { label: 'Inspection date', value: meta.inspection_date || '—' },
    { label: 'Inspected by', value: meta.inspector_name || '—' },
    { label: 'Expected resolution', value: meta.expected_resolution_date || '—' },
  ]

  return (
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '24px 22px 22px', animation: 'fade .25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <img src={asblLogo} alt="ASBL" style={{ height: 18 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: '#667085' }}>SPECTRA</span>
      </div>
      <div style={{ width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: issued ? '#D93F2B' : '#12805A', background: issued ? '#FDEBD9' : '#EAF7F1' }}>
        <i className={issued ? 'ph-fill ph-warning-circle' : 'ph-fill ph-check-circle'} style={{ fontSize: 40 }} />
      </div>
      <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-.02em', margin: '18px 0 6px' }}>Report submitted</div>
      <div style={{ fontSize: 14, color: '#667085', lineHeight: 1.5, marginBottom: 22 }}>
        {issued
          ? `${totalIssues} issues were raised across the unit. The report has been generated in ASBL format and shared with the handover team.`
          : 'No issues were raised. The flat is clear for the acceptance path.'}
      </div>
      <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '16px 18px', borderBottom: '1px solid #F2F3F5' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0D0D' }}>{unit.unit_no}</div>
            <div style={{ fontSize: 12, color: '#667085' }}>{unit.config} · {unit.customer_name}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, whiteSpace: 'nowrap', color: issued ? '#D93F2B' : '#12805A', background: issued ? '#FDEBD9' : '#EAF7F1' }}>
            <i className={issued ? 'ph-fill ph-warning-circle' : 'ph-fill ph-check-circle'} style={{ fontSize: 13 }} />
            {issued ? `Issues raised · ${totalIssues}` : 'No issues'}
          </div>
        </div>
        <div style={{ padding: '6px 18px 10px' }}>
          {summary.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #F4F5F7' }}>
              <span style={{ fontSize: 13, color: '#667085' }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 16, padding: '12px 14px', background: '#EEF2F7', borderRadius: 12 }}>
        <i className="ph ph-arrow-bend-down-right" style={{ color: '#0055CC', fontSize: 17 }} />
        <span style={{ fontSize: 12, color: '#475161', lineHeight: 1.4 }}>Shared with ASBL for issue resolution & consent.</span>
      </div>
      <div style={{ flex: 1 }} />
      <a href={reportUrl} target="_blank" rel="noreferrer"
        className="btn-primary" style={{ marginTop: 20, textDecoration: 'none' }}>
        <i className="ph ph-file-text" style={{ fontSize: 19 }} />View report
      </a>
      <button className="btn-secondary" style={{ marginTop: 10 }} onClick={onDone}>Done</button>
    </div>
  )
}
