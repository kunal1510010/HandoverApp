const ITEMS = [
  { key: 'helmet', label: 'Wearing a safety helmet', icon: 'ph-fill ph-hard-hat' },
  { key: 'vest', label: 'Wearing a hi-vis vest', icon: 'ph-fill ph-t-shirt' },
  { key: 'aware', label: 'Aware this is an active site', icon: 'ph-fill ph-warning' },
]

export default function Safety({ safety, setSafety, onBack, onContinue }) {
  const ok = safety.helmet && safety.vest && safety.aware
  return (
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: 24, animation: 'fade .25s ease' }}>
      <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7A99', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 22 }}>
        <i className="ph ph-arrow-left" />Back
      </div>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <i className="ph-fill ph-hard-hat" style={{ fontSize: 34, color: '#EA7A1E' }} />
      </div>
      <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8 }}>Site safety check</div>
      <div style={{ fontSize: 14, color: '#6B7A99', lineHeight: 1.5, marginBottom: 24 }}>This is an active handover site. Confirm the following before check-in.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ITEMS.map((s) => {
          const on = safety[s.key]
          return (
            <div key={s.key} onClick={() => setSafety((x) => ({ ...x, [s.key]: !x[s.key] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 15, borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${on ? '#EA4E20' : '#E6E8EC'}`, background: on ? '#FEF2ED' : '#fff' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: on ? '#EA4E20' : '#8A94A6', background: on ? '#FDEBD9' : '#F1F2F4' }}>
                <i className={s.icon} style={{ fontSize: 16 }} />
              </div>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#141B2D' }}>{s.label}</span>
              <i className={on ? 'ph-fill ph-check-circle' : 'ph ph-circle'} style={{ fontSize: 22, color: on ? '#EA4E20' : '#D4D9E0' }} />
            </div>
          )
        })}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn-primary" style={{ marginTop: 20, background: ok ? '#EA4E20' : '#F0D2C6', cursor: ok ? 'pointer' : 'not-allowed' }} onClick={onContinue}>
        I acknowledge — check in
      </button>
    </div>
  )
}
