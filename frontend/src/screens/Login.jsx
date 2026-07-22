export default function Login({ cust, setCust, otp, setOtp, otpSent, otpError, sendOtp, verifyOtp, onNotReady }) {
  function primaryAuth() {
    if (!otpSent) { sendOtp(); return }
    verifyOtp()
  }
  return (
    <div className="scrl" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '28px 24px 24px', animation: 'fade .25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', color: '#EA4E20' }}>ASBL</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#6B7A99' }}>
          <span style={{ width: 7, height: 7, borderRadius: 9999, background: '#EA4E20' }} />SPECTRA
        </div>
      </div>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#FDEBD9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <i className="ph-fill ph-house-line" style={{ fontSize: 38, color: '#EA4E20' }} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.15, marginBottom: 8 }}>Handover<br />Inspection</div>
      <div style={{ fontSize: 14, color: '#6B7A99', lineHeight: 1.5, marginBottom: 28 }}>Enter the customer number linked to this unit to begin the guided inspection.</div>

      <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7A99', marginBottom: 7, display: 'block' }}>Customer number</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #E6E8EC', borderRadius: 12, padding: '0 14px', height: 52, marginBottom: 16 }}>
        <i className="ph ph-phone" style={{ fontSize: 19, color: '#8A94A6' }} />
        <input value={cust} onChange={(e) => setCust(e.target.value)} inputMode="numeric" placeholder="e.g. 8247883838"
          style={{ flex: 1, border: 0, outline: 0, fontSize: 16, fontWeight: 500, color: '#141B2D', background: 'transparent' }} />
      </div>

      {otpSent && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7A99', marginBottom: 7, display: 'block' }}>
            Enter OTP <span style={{ color: '#8A94A6', fontWeight: 500 }}>(mock: 0000)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #E6E8EC', borderRadius: 12, padding: '0 14px', height: 52, marginBottom: 10 }}>
            <i className="ph ph-lock-key" style={{ fontSize: 19, color: '#8A94A6' }} />
            <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={4} placeholder="4-digit code"
              style={{ flex: 1, border: 0, outline: 0, fontSize: 16, fontWeight: 500, letterSpacing: '.3em', color: '#141B2D', background: 'transparent' }} />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#E6E8EC' }} /><span style={{ fontSize: 12, color: '#8A94A6' }}>or</span><div style={{ flex: 1, height: 1, background: '#E6E8EC' }} />
      </div>
      <div onClick={onNotReady} style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6B7A99', cursor: 'pointer' }}>
        Flat not showing as ready? <span style={{ color: '#EA4E20', fontWeight: 600 }}>See options</span>
      </div>
    </div>
  )
}
