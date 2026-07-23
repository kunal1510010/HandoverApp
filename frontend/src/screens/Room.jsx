import { useEffect } from 'react'
import { CAT_ICON, itemsFor, roomStat } from '../checklist'

const verifyStyle = { flex: 1.3, height: 48, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: '#EAF7F1', color: '#12805A', border: '1px solid #1FA971' }

function secondaryStyle(active, defaultColor, activeColor, activeBorder) {
  const base = { flex: 1, height: 48, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', border: '1px solid #EAECF0', color: defaultColor }
  if (active) return { ...base, color: activeColor, border: `1px solid ${activeBorder}` }
  return base
}

const STATUS_MAP = {
  VERIFIED: { ic: 'ph-fill ph-check-circle', fg: '#12805A', bg: '#EAF7F1' },
  ISSUE: { ic: 'ph-fill ph-warning-circle', fg: '#B15A17', bg: '#FDEEE1' },
  SKIPPED: { ic: 'ph ph-minus-circle', fg: '#5A6478', bg: '#F0F2F5' },
}

export default function Room({ unit, checklist, responses, activeRoom, openCats, setOpenCats, editItem, setEditItem, onBack, setResp, onRaise, onToggleFixed, onNextRoom }) {
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

  useEffect(() => {
    setOpenCats((x) => {
      let changed = false
      const next = { ...x }
      cats.forEach((cat, i) => {
        const key = room.key + ':' + cat
        const isOpen = next[key] !== undefined ? next[key] : i === 0
        if (!isOpen) return
        const gitems = byCat[cat]
        const done = gitems.filter((m) => cells[m.id] && cells[m.id].response).length
        if (gitems.length && done === gitems.length) {
          next[key] = false
          changed = true
          const nextCat = cats[i + 1]
          if (nextCat) next[room.key + ':' + nextCat] = true
        }
      })
      return changed ? next : x
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, room.key])

  return (
    <>
      <div style={{ padding: '14px 18px', background: '#fff', borderBottom: '1px solid #EAECF0', flexShrink: 0, position: 'sticky', top: 0, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#667085' }}>Room {idx + 1} of {rooms.length}</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.label}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#F04E38', flexShrink: 0 }}>{pct}%</div>
        </div>
        <div style={{ height: 6, borderRadius: 9999, background: '#EEF0F3', overflow: 'hidden', marginTop: 10 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#F04E38', borderRadius: 9999, transition: 'width .3s ease' }} />
        </div>
      </div>
      <div className="scrl" style={{ flex: 1, overflow: 'auto', padding: '12px 16px 110px' }}>
        {cats.map((cat, catIdx) => {
          const gitems = byCat[cat]
          const key = room.key + ':' + cat
          const open = openCats[key] !== undefined ? openCats[key] : catIdx === 0
          let done = 0
          let issueCount = 0
          gitems.forEach((m) => {
            const c = cells[m.id]
            if (c && c.response) done++
            if (c) issueCount += c.issues.length
          })
          return (
            <div key={cat} style={{ marginBottom: 6 }}>
              <div onClick={() => setOpenCats((x) => ({ ...x, [key]: !(x[key] !== undefined ? x[key] : catIdx === 0) }))}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 4px', cursor: 'pointer' }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: '#EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={CAT_ICON[cat] || 'ph ph-check-square'} style={{ fontSize: 17, color: '#5A6478' }} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0D0D0D' }}>{cat}</span>
                {issueCount > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#D93F2B', background: '#FDEBD9', padding: '3px 8px', borderRadius: 9999 }}>{issueCount} issue{issueCount === 1 ? '' : 's'}</span>
                )}
                <span style={{ fontSize: 11, fontWeight: 600, color: '#667085' }}>{done}/{gitems.length}</span>
                <i className="ph ph-caret-down" style={{ fontSize: 18, color: '#667085', transition: 'transform .5s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </div>
              <div className={`cat-collapse${open ? ' open' : ''}`}>
              <div>
              {gitems.map((m) => {
                const c = cells[m.id] || { response: null, issues: [] }
                const resp = c.response
                const editing = editItem === room.key + '|' + m.id
                const showBtns = !resp || editing
                const sm = STATUS_MAP[resp]
                const statusLabel = resp === 'VERIFIED' ? 'Verified'
                  : resp === 'ISSUE' ? `${c.issues.length} issue${c.issues.length === 1 ? '' : 's'} raised`
                  : resp === 'SKIPPED' ? `Skipped${c.skip_reason ? ' · ' + c.skip_reason : ''}` : ''
                return (
                  <div key={m.id} style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 18, padding: 16, marginBottom: 10, boxShadow: '0 1px 2px rgba(16,24,40,.04)' }}>
                    <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#5A6478', background: '#EEF0F3', borderRadius: 9999, padding: '5px 11px', marginBottom: 10 }}>{m.sub}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1B2340', lineHeight: 1.4, letterSpacing: '-.01em', marginBottom: 14 }}>{m.text}</div>
                    {showBtns && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={verifyStyle} onClick={() => setResp(room.key, m.id, 'VERIFIED')}>
                          <i className="ph-fill ph-check-circle" style={{ fontSize: 17 }} />Verify
                        </button>
                        <button style={secondaryStyle(resp === 'ISSUE', '#475467', '#B15A17', '#EA7A1E')} onClick={() => onRaise(room.key, m.id)}>
                          <i className="ph ph-warning" style={{ fontSize: 16 }} />Issue
                        </button>
                        <button style={secondaryStyle(resp === 'SKIPPED', '#475467', '#5A6478', '#9AA3B2')} onClick={() => setResp(room.key, m.id, 'SKIPPED')}>
                          <i className="ph ph-arrow-right" style={{ fontSize: 16 }} />Skip
                        </button>
                      </div>
                    )}
                    {!!resp && !editing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 42, borderRadius: 11, padding: '0 13px', fontSize: 13, fontWeight: 500, background: sm ? sm.bg : '#F0F2F5', color: sm ? sm.fg : '#5A6478' }}>
                        <i className={sm ? sm.ic : ''} style={{ fontSize: 18 }} />
                        <span style={{ flex: 1 }}>{statusLabel}</span>
                        <span onClick={() => setEditItem(room.key + '|' + m.id)} style={{ fontSize: 12, fontWeight: 600, color: '#667085', cursor: 'pointer' }}>Change</span>
                      </div>
                    )}
                    {c.issues.length > 0 && (
                      <div style={{ marginTop: 11, borderTop: '1px dashed #EAECF0', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {c.issues.map((iss, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, overflow: 'hidden', background: '#8CA2BE' }}>
                              {iss.photos[0] && <img src={iss.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: iss.fixed ? 'line-through' : 'none' }}>{iss.heading}</div>
                              <div style={{ fontSize: 11, color: '#667085', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iss.exact_location}</div>
                            </div>
                            <div onClick={() => onToggleFixed(room.key, m.id, i)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 800, letterSpacing: '.06em', cursor: 'pointer', flexShrink: 0, padding: '3px 7px', borderRadius: 9999, color: iss.fixed ? '#12805A' : '#D93F2B', background: iss.fixed ? '#EAF7F1' : '#FDEBD9' }}>
                              <i className={iss.fixed ? 'ph-fill ph-check-circle' : 'ph ph-circle'} style={{ fontSize: 11 }} />
                              {iss.fixed ? 'FIXED' : 'RAISED'}
                            </div>
                          </div>
                        ))}
                        <div onClick={() => onRaise(room.key, m.id)} style={{ fontSize: 12, fontWeight: 700, color: '#F04E38', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <i className="ph ph-plus-circle" />Add another issue
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(to top,#F5F6F8 70%,rgba(245,246,248,0))' }}>
        <button onClick={() => nextRoom ? onNextRoom(nextRoom.key) : onBack()}
          style={{ width: '100%', height: 52, border: 0, borderRadius: 14, background: '#0D0D0D', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {nextRoom ? `Next · ${nextRoom.label}` : 'Back to rooms'}<i className="ph ph-arrow-right" />
        </button>
      </div>
    </>
  )
}
