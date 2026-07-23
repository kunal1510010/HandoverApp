import { itemsFor, roomStat } from '../checklist'

const META_FIELDS = [
  { key: 'inspector_name', label: 'Inspected by (Engineer)', placeholder: 'Name', type: 'text' },
  { key: 'inspector_contact', label: 'Inspector contact', placeholder: 'Phone', type: 'text' },
  { key: 'inspection_date', label: 'Inspection date', type: 'date' },
  { key: 'company', label: 'Company', placeholder: 'Optional', type: 'text' },
  { key: 'fm_name', label: 'Handover Executive (FM)', placeholder: 'Optional', type: 'text' },
]

export default function Review({ unit, checklist, responses, meta, setMeta, customerSigned, setCustomerSigned, inspectorSigned, setInspectorSigned, onBack, onDeleteIssue, onToggleFixed, onGenerate }) {
  const rooms = unit.rooms
  const stats = {}
  rooms.forEach((r) => { stats[r.key] = roomStat(r, checklist, responses) })
  const totalIssues = Object.values(stats).reduce((a, b) => a + b.issues, 0)
  const firstIncomplete = rooms.find((r) => !stats[r.key].complete)
  const roomsLeft = rooms.filter((r) => !stats[r.key].complete).length

  const allIssues = []
  rooms.forEach((r) => {
    const cells = responses[r.key] || {}
    itemsFor(r, checklist).forEach((m) => {
      const c = cells[m.id]
      if (c && c.issues.length) {
        c.issues.forEach((is, i) => allIssues.push({ roomKey: r.key, itemId: m.id, index: i, crumb: `${m.cat} → ${m.sub}`, room: r.label, ...is }))
      }
    })
  })
  const skippedItems = []
  rooms.forEach((r) => {
    const cells = responses[r.key] || {}
    itemsFor(r, checklist).forEach((m) => {
      const c = cells[m.id]
      if (c && c.response === 'SKIPPED') skippedItems.push({ text: `${m.cat} → ${m.sub}`, room: r.label })
    })
  })

  const signatures = [
    { role: 'Customer', name: unit.customer_name, signed: customerSigned, onSign: () => setCustomerSigned((v) => !v) },
    { role: 'Inspector', name: meta.inspector_name || 'Inspector', signed: inspectorSigned, onSign: () => setInspectorSigned((v) => !v) },
  ]

  return (
    <>
      <div style={{ padding: '14px 18px', background: '#fff', borderBottom: '1px solid #EAECF0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#667085' }}>Review</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.01em' }}>Review & summary</div>
        </div>
      </div>
      <div className="scrl" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 120px' }}>
        {roomsLeft > 0 && (
          <div style={{ display: 'flex', gap: 10, padding: '13px 14px', background: '#FFF4E5', border: '1px solid #F6D9AE', borderRadius: 14, marginBottom: 16 }}>
            <i className="ph-fill ph-warning" style={{ color: '#EA7A1E', fontSize: 20 }} />
            <div style={{ fontSize: 13, color: '#8A5410', lineHeight: 1.4 }}>
              <b>{firstIncomplete ? stats[firstIncomplete.key].total - stats[firstIncomplete.key].done : 0} items not yet actioned</b> in {firstIncomplete?.label}. You can still generate, but they won't appear in the report.
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 16, padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: '#D93F2B', background: '#FDEBD9', padding: '4px 9px', borderRadius: 9999 }}>RAISED</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0D0D0D' }}>Total {totalIssues} issues</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {rooms.map((r) => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F4F5F7' }}>
                <span style={{ fontSize: 13, color: '#475161' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: stats[r.key].issues > 0 ? '#D93F2B' : '#B7BEC9' }}>{stats[r.key].issues}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#667085', letterSpacing: '.02em', margin: '6px 4px 10px' }}>INSPECTION DETAILS</div>
        <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 16, padding: 16, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {META_FIELDS.map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#667085', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input type={f.type} value={meta[f.key] || ''} placeholder={f.placeholder} onChange={(e) => setMeta((m) => ({ ...m, [f.key]: e.target.value }))}
                style={{ width: '100%', height: 44, border: '1px solid #EAECF0', borderRadius: 10, padding: '0 12px', fontSize: 14, fontWeight: 500, color: '#0D0D0D', outline: 0 }} />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#667085', letterSpacing: '.02em', margin: '6px 4px 10px' }}>ALL ISSUES ({totalIssues})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {allIssues.map((ai, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #EAECF0', borderRadius: 14, padding: '11px 13px' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: '#8CA2BE' }}>
                {ai.photos[0] && <img src={ai.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#667085', marginBottom: 1 }}>{ai.crumb}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: ai.fixed ? 'line-through' : 'none' }}>{ai.heading}</div>
                <div style={{ fontSize: 11, color: '#667085', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ai.room} · {ai.exact_location}</div>
              </div>
              <div onClick={() => onToggleFixed(ai.roomKey, ai.itemId, ai.index)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 800, letterSpacing: '.06em', cursor: 'pointer', flexShrink: 0, padding: '3px 7px', borderRadius: 9999, color: ai.fixed ? '#12805A' : '#D93F2B', background: ai.fixed ? '#EAF7F1' : '#FDEBD9' }}>
                <i className={ai.fixed ? 'ph-fill ph-check-circle' : 'ph ph-circle'} style={{ fontSize: 11 }} />
                {ai.fixed ? 'FIXED' : 'RAISED'}
              </div>
              <i onClick={() => onDeleteIssue(ai.roomKey, ai.itemId, ai.index)} className="ph ph-trash" style={{ fontSize: 18, color: '#B7BEC9', cursor: 'pointer', flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {skippedItems.length > 0 && (
          <div style={{ background: '#F7F8FA', border: '1px solid #EAECF0', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#667085', marginBottom: 8 }}>SKIPPED ({skippedItems.length})</div>
            {skippedItems.map((sk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: '#667085' }}>
                <i className="ph ph-arrow-right" style={{ color: '#667085' }} /><span style={{ flex: 1 }}>{sk.text}</span><span style={{ color: '#B7BEC9' }}>{sk.room}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 700, color: '#667085', letterSpacing: '.02em', margin: '6px 4px 10px' }}>PARTICIPANT SIGN-OFF</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {signatures.map((sg) => (
            <div key={sg.role} onClick={sg.onSign}
              style={{ flex: 1, border: `1.5px solid ${sg.signed ? '#F04E38' : '#EAECF0'}`, borderRadius: 14, padding: 12, cursor: 'pointer', background: sg.signed ? '#FEF6F3' : '#fff' }}>
              <div style={{ height: 40, borderBottom: '1.5px dashed #D4D9E0', display: 'flex', alignItems: 'flex-end', paddingBottom: 3 }}>
                <span style={sg.signed ? { fontFamily: "'Segoe Script','Bradley Hand',cursive", fontSize: 19, color: '#0D0D0D' } : { fontSize: 12, color: '#B7BEC9', fontWeight: 600 }}>
                  {sg.signed ? sg.name.split(' ')[0] : 'Tap to sign'}
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#667085', marginTop: 7 }}>{sg.role}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0D0D0D' }}>{sg.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(to top,#F5F6F8 72%,rgba(245,246,248,0))' }}>
        <button className="btn-primary" style={{ height: 54 }} onClick={() => onGenerate(totalIssues)}>
          <i className="ph ph-file-text" style={{ fontSize: 20 }} />Generate Report
        </button>
      </div>
    </>
  )
}
