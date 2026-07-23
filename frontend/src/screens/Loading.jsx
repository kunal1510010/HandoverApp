import { useEffect, useState } from 'react'

const MESSAGES = [
  'Loading room checklists…',
  'Tip: good lighting makes hairline cracks easier to spot.',
  'Carrying forward anything from the last visit…',
  'A clean checklist today means a smooth handover tomorrow.',
  'Tip: check door and window alignment before painting touch-ups.',
  'Almost there…',
]

const SIZE = 110
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Loading() {
  const [pct, setPct] = useState(4)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPct((p) => (p < 96 ? p + Math.ceil(Math.random() * 5) : p)), 350)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'fade .25s ease' }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#EEF0F3" strokeWidth={STROKE} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#F04E38" strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(pct, 100) / 100)}
          style={{ transition: 'stroke-dashoffset .3s ease' }} />
      </svg>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0D0D', marginTop: 18 }}>{Math.min(pct, 100)}% Complete</div>
      <div style={{ fontSize: 13, color: '#667085', lineHeight: 1.5, textAlign: 'center', marginTop: 10, maxWidth: 280, minHeight: 40 }}>
        {MESSAGES[msgIdx]}
      </div>
    </div>
  )
}
