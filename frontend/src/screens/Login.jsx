import asblLogo from '../assets/Nav-black-logo.svg'

export default function Login({ cust, setCust, otp, setOtp, otpSent, otpError, sendOtp, verifyOtp }) {
  function primaryAuth() {
    if (!otpSent) { sendOtp(); return }
    verifyOtp()
  }
  return (
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '28px 24px 24px', animation: 'fade .25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <img src={asblLogo} alt="ASBL" style={{ height: 15 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#667085' }}>
          <span style={{ width: 7, height: 7, borderRadius: 9999, background: '#F04E38' }} />SPECTRA
        </div>
      </div>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#FDEBD9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <i className="ph-fill ph-house-line" style={{ fontSize: 38, color: '#F04E38' }} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.15, marginBottom: 8 }}>Handover<br />Inspection</div>
      <div style={{ fontSize: 14, color: '#667085', lineHeight: 1.5, marginBottom: 28 }}>Enter the customer number linked to this unit to begin the guided inspection.</div>

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

      <div style={{ flex: 1 }} />
      <button className="btn-primary" style={{ marginTop: 20 }} onClick={primaryAuth}>
        {otpSent ? 'Verify & continue' : 'Send OTP'}
      </button>
    </div>
  )
}
