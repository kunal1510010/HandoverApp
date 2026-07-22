import { useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 4

export default function FloorPlanModal({ src, onClose }) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  function clampScale(s) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
  }

  function onWheel(e) {
    e.preventDefault()
    setScale((s) => clampScale(s - e.deltaY * 0.01))
  }

  function onDoubleClick() {
    setScale((s) => (s > 1 ? 1 : 2))
    setPos({ x: 0, y: 0 })
  }

  function onPointerDown(e) {
    if (scale === 1) return
    drag.current = { startX: e.clientX - pos.x, startY: e.clientY - pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!drag.current) return
    setPos({ x: e.clientX - drag.current.startX, y: e.clientY - drag.current.startY })
  }

  function onPointerUp() {
    drag.current = null
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(10,13,22,.92)', display: 'flex', flexDirection: 'column', animation: 'fade .2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, flexShrink: 0 }}>
        <i onClick={onClose} className="ph ph-x" style={{ fontSize: 26, color: '#fff', cursor: 'pointer' }} />
      </div>
      <div
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ flex: 1, overflow: 'hidden', touchAction: 'none', cursor: scale > 1 ? 'grab' : 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src={src} alt="Floor plan" draggable={false}
          style={{ maxWidth: '100%', maxHeight: '100%', transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: drag.current ? 'none' : 'transform .15s ease', userSelect: 'none' }} />
      </div>
      <div style={{ textAlign: 'center', color: '#B7C0D4', fontSize: 12, padding: '10px 0 18px', flexShrink: 0 }}>Scroll or pinch to zoom · drag to move · double-tap to reset</div>
    </div>
  )
}
