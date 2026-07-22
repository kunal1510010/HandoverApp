import { CAT_ICON, itemsFor, roomStat } from '../checklist'

const V = { bg: '#E7F6EF', fg: '#12805A', bd: '#1FA971' }
const R = { bg: '#FDEBD9', fg: '#B15A17', bd: '#EA7A1E' }
const Sp = { bg: '#EEF0F3', fg: '#5A6478', bd: '#9AA3B2' }

function btnStyle(active, palette) {
  const base = { flex: 1, height: 44, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
  if (active) return { ...base, background: palette.bg, color: palette.fg, border: `1px solid ${palette.bd}` }
  return { ...base, background: '#fff', color: '#8A94A6', border: '1px solid #E6E8EC' }
}

const STATUS_MAP = {
  VERIFIED: { ic: 'ph-fill ph-check-circle', fg: '#12805A', bg: '#EAF7F1' },
  ISSUE: { ic: 'ph-fill ph-warning-circle', fg: '#B15A17', bg: '#FDEEE1' },
  SKIPPED: { ic: 'ph ph-minus-circle', fg: '#5A6478', bg: '#F0F2F5' },
}

export default function Room({ unit, checklist, responses, activeRoom, openCats, setOpenCats, editItem, setEditItem, onBack, setResp, onRaise, onNextRoom }) {
  const rooms = unit.rooms
  const room = rooms.find((r) => r.key === activeRoom) || rooms[0]
  const cells = responses[room.key] || {}
  const items = itemsFor(room, checklist)
  const stat = roomStat(room, checklist, responses)
  const pct = stat.total ? Math.round((stat.done / stat.total) * 100) : 0
  const idx = rooms.findIndex((r) => r.key === room.key)
  const nextRoom = rooms[idx + 1]

  const cats = []
  const byCat = {}
  items.forEach((m) => {
    if (!byCat[m.cat]) { byCat[m.cat] = []; cats.push(m.cat) }
    byCat[m.cat].push(m)
  })

  return (
    <>
      <div style={{ padding: '14px 18px', background: '#fff', borderBottom: '1px solid #EDEFF2', flexShrink: 0, position: 'sticky', top: 0, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E6E8EC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7A99' }}>Room {idx + 1} of {rooms.length}</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.label}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#EA4E20', flexShrink: 0 }}>{pct}%</div>
        </div>
        <div style={{ height: 6, borderRadius: 9999, background: '#EEF0F3', overflow: 'hidden', marginTop: 10 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#EA4E20', borderRadius: 9999, transition: 'width .3s ease' }} />
        </div>
      </div>
      <div className="scrl" style={{ flex: 1, overflow: 'auto', padding: '12px 16px 110px' }}>
        {cats.map((cat) => {
          const gitems = byCat[cat]
          const open = openCats[cat] !== undefined ? openCats[cat] : true
          let done = 0
          gitems.forEach((m) => { if (cells[m.id] && cells[m.id].response) done++ })
          return (
            <div key={cat} style={{ marginBottom: 6 }}>
              <div onClick={() => setOpenCats((x) => ({ ...x, [cat]: !(x[cat] !== undefined ? x[cat] : true) }))}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 4px', cursor: 'pointer' }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: '#EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={CAT_ICON[cat] || 'ph ph-check-square'} style={{ fontSize: 17, color: '#5A6478' }} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#141B2D' }}>{cat}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#8A94A6' }}>{done}/{gitems.length}</span>
                <i className={open ? 'ph ph-caret-up' : 'ph ph-caret-down'} style={{ fontSize: 18, color: '#8A94A6' }} />
              </div>
              {open && gitems.map((m) => {
                const c = cells[m.id] || { response: null, issues: [] }
                const resp = c.response
                const editing = editItem === room.key + '|' + m.id
                const showBtns = !resp || editing
                const sm = STATUS_MAP[resp]
                const statusLabel = resp === 'VERIFIED' ? 'Verified'
                  : resp === 'ISSUE' ? `${c.issues.length} issue${c.issues.length === 1 ? '' : 's'} raised`
                  : resp === 'SKIPPED' ? `Skipped${c.skip_reason ? ' · ' + c.skip_reason : ''}` : ''
                return (
                  <div key={m.id} style={{ background: '#fff', border: '1px solid #EDEFF2', borderRadius: 14, padding: 14, marginBottom: 9 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7A99', letterSpacing: '.01em', marginBottom: 3 }}>{m.cat} → {m.sub}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#243044', lineHeight: 1.45, marginBottom: 12 }}>{m.text}</div>
                    {showBtns && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={btnStyle(resp === 'VERIFIED', V)} onClick={() => setResp(room.key, m.id, 'VERIFIED')}>
                          <i className="ph ph-check-circle" style={{ fontSize: 16 }} />Verify
                        </button>
                        <button style={btnStyle(resp === 'ISSUE', R)} onClick={() => onRaise(room.key, m.id)}>
                          <i className="ph ph-warning" style={{ fontSize: 16 }} />Issue
                        </button>
                        <button style={btnStyle(resp === 'SKIPPED', Sp)} onClick={() => setResp(room.key, m.id, 'SKIPPED')}>
                          <i className="ph ph-arrow-right" style={{ fontSize: 16 }} />Skip
                        </button>
                      </div>
                    )}
                    {!!resp && !editing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 42, borderRadius: 11, padding: '0 13px', fontSize: 13, fontWeight: 500, background: sm ? sm.bg : '#F0F2F5', color: sm ? sm.fg : '#5A6478' }}>
                        <i className={sm ? sm.ic : ''} style={{ fontSize: 18 }} />
                        <span style={{ flex: 1 }}>{statusLabel}</span>
                        <span onClick={() => setEditItem(room.key + '|' + m.id)} style={{ fontSize: 12, fontWeight: 600, color: '#6B7A99', cursor: 'pointer' }}>Change</span>
                      </div>
                    )}
                    {c.issues.length > 0 && (
                      <div style={{ marginTop: 11, borderTop: '1px dashed #EDEFF2', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {c.issues.map((iss, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, overflow: 'hidden', background: '#8CA2BE' }}>
                              {iss.photos[0] && <img src={iss.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#141B2D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iss.heading}</div>
                              <div style={{ fontSize: 11, color: '#8A94A6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iss.exact_location}</div>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: '#D9600A', background: '#FDEBD9', padding: '3px 7px', borderRadius: 9999 }}>RAISED</span>
                          </div>
                        ))}
                        <div onClick={() => onRaise(room.key, m.id)} style={{ fontSize: 12, fontWeight: 700, color: '#EA4E20', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <i className="ph ph-plus-circle" />Add another issue
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(to top,#F5F6F8 70%,rgba(245,246,248,0))' }}>
        <button onClick={() => nextRoom ? onNextRoom(nextRoom.key) : onBack()}
          style={{ width: '100%', height: 52, border: 0, borderRadius: 14, background: '#141B2D', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {nextRoom ? `Next · ${nextRoom.label}` : 'Back to rooms'}<i className="ph ph-arrow-right" />
        </button>
      </div>
    </>
  )
}
