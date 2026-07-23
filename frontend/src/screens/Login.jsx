import asblLogo from '../assets/Nav-black-logo.svg'

const HOW_IT_WORKS = [
  { icon: 'ph-fill ph-shield-check', text: "Verified Checklist" },
  { icon: 'ph-fill ph-person-simple-walk', text: 'Simplifies Issue Reporting' },
  { icon: 'ph-fill ph-file-text', text: 'Instant Report Generation' },
]

export default function Login({ cust, setCust, otp, setOtp, otpSent, otpError, sendOtp, verifyOtp }) {
  function primaryAuth() {
    if (!otpSent) { sendOtp(); return }
    verifyOtp()
  }
  return (
    <div className="scrl" style={{
      flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '28px 24px 24px', animation: 'fade .25s ease',
      backgroundColor: '#fff',
      backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(240,78,56,.16), rgba(240,78,56,0) 70%)',
    }}>
      <div style={{ marginBottom: 40 }}>
        {/* <img src={asblLogo} alt="ASBL" style={{ height: 15 }} /> */}
      </div>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#FDEBD9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <i className="ph-fill ph-house-line" style={{ fontSize: 38, color: '#F04E38' }} />
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.15, marginBottom: 16}}> <img src={asblLogo} alt="ASBL" style={{ height: 12 , marginBottom: 5}} /><br />Pravesh</div>
      <div style={{ fontSize: 14, color: '#667085', lineHeight: 1.5, marginBottom: 28 }}>Please enter customer's registered number to begin the guided inspection.</div>

      <label style={{ fontSize: 12, fontWeight: 600, color: '#667085', marginBottom: 7, display: 'block' }}>Customer number</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #EAECF0', borderRadius: 12, padding: '0 14px', height: 52, marginBottom: 16 }}>
        <i className="ph ph-phone" style={{ fontSize: 19, color: '#667085' }} />
        <input value={cust} onChange={(e) => setCust(e.target.value)} inputMode="numeric" placeholder="e.g. 8247883838"
          style={{ flex: 1, border: 0, outline: 0, fontSize: 16, fontWeight: 500, color: '#0D0D0D', background: 'transparent' }} />
      </div>

      {otpSent && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#667085', marginBottom: 7, display: 'block' }}>
            Enter OTP <span style={{ color: '#667085', fontWeight: 500 }}>(mock: 0000)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #EAECF0', borderRadius: 12, padding: '0 14px', height: 52, marginBottom: 10 }}>
            <i className="ph ph-lock-key" style={{ fontSize: 19, color: '#667085' }} />
            <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={4} placeholder="4-digit code"
              style={{ flex: 1, border: 0, outline: 0, fontSize: 16, fontWeight: 500, letterSpacing: '.3em', color: '#0D0D0D', background: 'transparent' }} />
          </div>
        </>
      )}
      {otpError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#C4320A', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
          <i className="ph-fill ph-warning-circle" />{otpError}
        </div>
      )}

      {!otpSent && (
        <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: '#667085' }}>HOW IT WORKS</div>
          {HOW_IT_WORKS.map((s) => (
            <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FDEBD9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={s.icon} style={{ fontSize: 17, color: '#F04E38' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#243044' }}>{s.text}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 20 }} />
      <button className="btn-primary" onClick={primaryAuth}>
        {otpSent ? 'Verify & continue' : 'Send OTP'}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 12, color: '#667085' }}>
        <i className="ph-fill ph-lock-simple" />For registered inspectors and homeowners
      </div>
    </div>
  )
}
