import { ROOM_ICON, roomStat } from '../checklist'
import asblLogo from '../assets/Nav-black-logo.svg'

export default function Hub({ unit, checklist, responses, offline, onOpenRoom, onReview }) {
  const rooms = unit.rooms
  const stats = {}
  rooms.forEach((r) => { stats[r.key] = roomStat(r, checklist, responses) })
  const totalItems = Object.values(stats).reduce((a, b) => a + b.total, 0)
  const totalDone = Object.values(stats).reduce((a, b) => a + b.done, 0)
  const totalIssues = Object.values(stats).reduce((a, b) => a + b.issues, 0)
  const overallPct = totalItems ? Math.round((totalDone / totalItems) * 100) : 0
  const roomsLeft = rooms.filter((r) => !stats[r.key].complete).length
  const firstIncomplete = rooms.find((r) => !stats[r.key].complete)

  return (
    <>
      <div style={{ padding: '18px 20px 14px', background: '#fff', borderBottom: '1px solid #EAECF0', flexShrink: 0 }}>
        <img src={asblLogo} alt="ASBL" style={{ height: 15, marginBottom: 16 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#667085' }}>{unit.project} · {unit.config}</div>
            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em' }}>Unit {unit.unit_no}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Connectivity">
            <i className={offline ? 'ph ph-cloud-slash' : 'ph ph-wifi-high'} style={{ fontSize: 19, color: '#667085' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D', flexShrink: 0 }}>Overall progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#F04E38', whiteSpace: 'nowrap', flexShrink: 0 }}>{overallPct}% · {totalDone}/{totalItems}</span>
        </div>
        <div style={{ height: 9, borderRadius: 9999, background: '#EEF0F3', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${overallPct}%`, background: '#F04E38', borderRadius: 9999, transition: 'width .3s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div style={{ flex: 1, background: '#FDEBD9', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#D93F2B', lineHeight: 1 }}>{totalIssues}</div>
            <div style={{ fontSize: 11, color: '#B15A17', fontWeight: 600, marginTop: 2 }}>Issues raised</div>
          </div>
          <div style={{ flex: 1, background: '#EEF0F3', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0D0D0D', lineHeight: 1 }}>{roomsLeft}</div>
            <div style={{ fontSize: 11, color: '#667085', fontWeight: 600, marginTop: 2 }}>Rooms left</div>
          </div>
        </div>
      </div>
      <div className="scrl" style={{ flex: 1, overflow: 'auto', padding: '14px 16px 120px' }}>
        {rooms.map((r) => {
          const s = stats[r.key]
          const status = s.complete ? 'complete' : s.done > 0 ? 'partial' : 'todo'
          const statusIcon = status === 'complete' ? 'ph-fill ph-check-circle' : status === 'partial' ? 'ph ph-dots-three-circle' : 'ph ph-circle'
          const statusColor = status === 'complete' ? '#1FA971' : status === 'partial' ? '#EA7A1E' : '#D4D9E0'
          return (
            <div key={r.key} onClick={() => onOpenRoom(r.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #EAECF0', borderRadius: 16, padding: '13px 14px', marginBottom: 9, cursor: 'pointer' }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: s.issues > 0 ? '#D93F2B' : '#5A6478', background: s.issues > 0 ? '#FDEBD9' : '#EEF2F7' }}>
                <i className={ROOM_ICON[r.type] || 'ph ph-cube'} style={{ fontSize: 22 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0D' }}>{r.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 12, color: '#667085' }}>{s.done}/{s.total} checked</span>
                  {s.issues > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#D93F2B', background: '#FDEBD9', padding: '2px 8px', borderRadius: 9999 }}>
                      {s.issues}{s.issues === 1 ? ' issue' : ' issues'}
                    </span>
                  )}
                </div>
              </div>
              <i className={statusIcon} style={{ fontSize: 24, flexShrink: 0, color: statusColor }} />
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(to top,#F5F6F8 70%,rgba(245,246,248,0))', display: 'flex', gap: 10 }}>
        <button className="btn-primary" style={{ flex: 1, height: 52, minWidth: 0 }} onClick={() => firstIncomplete ? onOpenRoom(firstIncomplete.key) : onReview()}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstIncomplete ? `Continue · ${firstIncomplete.label}` : 'All rooms checked'}
          </span>
          <i className="ph ph-arrow-right" style={{ flexShrink: 0 }} />
        </button>
        <button onClick={onReview} title="Review & Generate"
          style={{ width: 56, height: 52, border: '1px solid #EAECF0', borderRadius: 14, background: '#fff', color: '#0D0D0D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ph ph-list-checks" style={{ fontSize: 22 }} />
        </button>
      </div>
    </>
  )
}
