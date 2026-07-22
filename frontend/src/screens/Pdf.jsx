import { itemsFor, roomStat } from '../checklist'

export default function Pdf({ unit, checklist, responses, meta, pdfVariant, customerSigned, inspectorSigned, inspectionId, onBack, onShare, onFinish }) {
  const rooms = unit.rooms
  const stats = {}
  rooms.forEach((r) => { stats[r.key] = roomStat(r, checklist, responses) })
  const totalIssues = Object.values(stats).reduce((a, b) => a + b.issues, 0)
  const pdfZero = pdfVariant === 'zero'
  const pdfHasIssues = !pdfZero && totalIssues > 0

  const pdfMeta = [
    { label: 'Expected Resolution Day', value: meta.expected_resolution_date || '—' },
    { label: 'Inspected by (Engineer)', value: `${meta.inspector_name || '—'} · ${meta.inspector_contact || '—'}` },
    { label: 'Inspection Date', value: meta.inspection_date || '—' },
    { label: 'House Sq.ft', value: unit.sqft },
    { label: 'Handover Executive', value: meta.fm_name || '—' },
  ]

  const pdfGroups = []
  rooms.forEach((r) => {
    const cells = responses[r.key] || {}
    const issues = []
    itemsFor(r, checklist).forEach((m) => {
      const c = cells[m.id]
      if (c && c.issues.length) c.issues.forEach((is) => issues.push({ crumb: `${m.cat} → ${m.sub}`, text: m.text, ...is }))
    })
    if (issues.length) pdfGroups.push({ label: r.label, issues })
  })

  return (
    <>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #EDEFF2', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E6E8EC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 17 }} />
        </div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 800 }}>Report preview</div>
      </div>
      <div className="scrl" style={{ flex: 1, overflow: 'auto', padding: 16, background: '#DADEE4' }}>
        <div style={{ background: '#fff', borderRadius: 6, boxShadow: '0 6px 24px rgba(20,27,45,.14)', overflow: 'hidden' }}>
          <div style={{ padding: '26px 24px 22px', borderBottom: '3px solid #EA4E20' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#EA4E20' }}>ASBL</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: '#6B7A99' }}>{unit.product}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', color: '#EA4E20', marginBottom: 6 }}>HANDOVER INSPECTION REPORT</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.01em', color: '#141B2D' }}>{unit.customer_name}</div>
            <div style={{ fontSize: 13, color: '#6B7A99', marginTop: 3 }}>{unit.unit_no} · {unit.email}</div>
          </div>
          <div style={{ padding: '20px 24px', borderBottom: '8px solid #F1F2F4' }}>
            {pdfZero && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EAF6F0', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <i className="ph-fill ph-check-circle" style={{ fontSize: 28, color: '#1FA971' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0E7A52' }}>No issues raised</div>
                  <div style={{ fontSize: 12, color: '#3B8C6A' }}>Flat is clear for the acceptance path.</div>
                </div>
              </div>
            )}
            {pdfHasIssues && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: '#D9600A', background: '#FDEBD9', padding: '4px 9px', borderRadius: 9999 }}>RAISED</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#141B2D' }}>Total {totalIssues} issues</span>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 24px', marginBottom: 14 }}>
              {pdfMeta.map((pm) => (
                <div key={pm.label} style={{ minWidth: '42%' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', color: '#8A94A6', marginBottom: 2 }}>{pm.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#141B2D' }}>{pm.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#8A94A6', fontStyle: 'italic', marginBottom: 14 }}>All issues that can be rectified are mentioned in the sub-locations list.</div>
            <div style={{ border: '1px solid #EDEFF2', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', background: '#F7F8FA', padding: '9px 14px', fontSize: 11, fontWeight: 700, color: '#6B7A99' }}>
                <span style={{ flex: 1 }}>SUB-LOCATION</span><span>NO. OF ISSUES</span>
              </div>
              {rooms.map((r) => {
                const count = pdfZero ? 0 : stats[r.key].issues
                return (
                  <div key={r.key} style={{ display: 'flex', padding: '9px 14px', borderTop: '1px solid #F1F2F4', fontSize: 13 }}>
                    <span style={{ flex: 1, color: '#475161' }}>{r.label}</span>
                    <span style={{ fontWeight: 700, color: count > 0 ? '#D9600A' : '#B7BEC9' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
          {pdfHasIssues && (
            <div style={{ padding: '18px 24px 8px' }}>
              {pdfGroups.map((pg) => (
                <div key={pg.label} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#141B2D', paddingBottom: 8, borderBottom: '2px solid #141B2D', marginBottom: 12 }}>{pg.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {pg.issues.map((pi, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7A99', marginBottom: 7 }}>{pi.crumb}</div>
                        <div style={{ position: 'relative', height: 150, borderRadius: 8, overflow: 'hidden', background: '#8CA2BE' }}>
                          <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: '#D9600A', background: '#FDEBD9', padding: '3px 8px', borderRadius: 9999 }}>RAISED</span>
                          {pi.photos[0] && <img src={pi.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ marginTop: 9 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#8A94A6' }}>Checklist  </span><span style={{ fontSize: 12, color: '#475161' }}>{pi.text}</span></div>
                        <div style={{ marginTop: 3 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#8A94A6' }}>Exact Location  </span><span style={{ fontSize: 12, color: '#475161' }}>{pi.exact_location}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '20px 24px 26px', borderTop: '8px solid #F1F2F4', display: 'flex', gap: 20 }}>
            {[{ role: 'Customer Signature', name: unit.customer_name, signed: customerSigned },
              { role: 'Inspector Signature', name: meta.inspector_name, signed: inspectorSigned }].map((ps) => (
              <div key={ps.role} style={{ flex: 1 }}>
                <div style={{ height: 40, borderBottom: '1.5px solid #141B2D', display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                  <span style={{ fontFamily: "'Segoe Script','Bradley Hand',cursive", fontSize: 18, color: '#141B2D' }}>{ps.signed ? (ps.name || '').split(' ')[0] : ''}</span>
                </div>
                <div style={{ fontSize: 10, color: '#8A94A6', marginTop: 6 }}>{ps.role}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#141B2D' }}>{ps.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>
      <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #EDEFF2', display: 'flex', gap: 10 }}>
        <button onClick={onShare} style={{ width: 52, height: 50, border: '1px solid #E6E8EC', borderRadius: 13, background: '#fff', color: '#141B2D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ph ph-share-network" style={{ fontSize: 20 }} />
        </button>
        <a href={`/api/inspection/${inspectionId}/report.pdf`} target="_blank" rel="noreferrer"
          style={{ flex: 1, height: 50, border: 0, borderRadius: 13, background: '#EA4E20', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
          <i className="ph ph-download-simple" style={{ fontSize: 19 }} />Download PDF
        </a>
        <button onClick={onFinish} title="Submit & finish"
          style={{ width: 52, height: 50, border: 0, borderRadius: 13, background: '#141B2D', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ph ph-check" style={{ fontSize: 20 }} />
        </button>
      </div>
    </>
  )
}
