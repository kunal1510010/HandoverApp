import { useRef } from 'react'

export default function IssueSheet({ draft, sheetError, uploading, onClose, onAddPhoto, onRemovePhoto, onHeadingChange, onLocationChange, onSave, onSaveAndAnother }) {
  const fileInput = useRef(null)

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,27,45,.45)', zIndex: 20, animation: 'fade .2s ease' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 21, background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '92%', display: 'flex', flexDirection: 'column', animation: 'sheetUp .28s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ padding: '14px 20px 6px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, background: '#E1E4E9', margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>Raise an issue</div>
            <i onClick={onClose} className="ph ph-x" style={{ fontSize: 22, color: '#8A94A6', cursor: 'pointer' }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7A99', marginTop: 2 }}>{draft.category} → {draft.subcategory} · {draft.subLocation}</div>
        </div>
        <div className="scrl" style={{ flex: 1, overflow: 'auto', padding: '6px 20px 16px' }}>
          <div style={{ fontSize: 12, color: '#8A94A6', background: '#F7F8FA', borderRadius: 10, padding: '10px 12px', lineHeight: 1.4, marginBottom: 16 }}>{draft.checklistText}</div>

          <label style={{ fontSize: 12, fontWeight: 700, color: '#141B2D', display: 'block', marginBottom: 8 }}>Photos <span style={{ color: '#C4320A' }}>*</span></label>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 6 }}>
            <div onClick={() => !uploading && fileInput.current?.click()}
              style={{ width: 78, height: 78, borderRadius: 14, background: '#EA4E20', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: uploading ? 'wait' : 'pointer', flexShrink: 0, opacity: uploading ? 0.7 : 1 }}>
              <i className={uploading ? 'ph ph-spinner' : 'ph-fill ph-camera'} style={{ fontSize: 26, color: '#fff' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{uploading ? 'Uploading' : 'Capture'}</span>
            </div>
            <input ref={fileInput} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files[0]; if (f) onAddPhoto(f); e.target.value = '' }} />
            {draft.photos.map((p, i) => (
              <div key={p.id} style={{ position: 'relative', width: 78, height: 78, borderRadius: 14, flexShrink: 0, overflow: 'hidden' }}>
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <i onClick={() => onRemovePhoto(i)} className="ph-fill ph-x-circle"
                  style={{ position: 'absolute', top: -6, right: -6, fontSize: 20, color: '#141B2D', background: '#fff', borderRadius: 9999, cursor: 'pointer' }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#8A94A6', marginBottom: 18 }}>At least one photo is required.</div>

          <label style={{ fontSize: 12, fontWeight: 700, color: '#141B2D', display: 'block', marginBottom: 7 }}>Heading</label>
          <input value={draft.heading} onChange={(e) => onHeadingChange(e.target.value)}
            style={{ width: '100%', height: 48, border: '1px solid #E6E8EC', borderRadius: 11, padding: '0 13px', fontSize: 15, fontWeight: 500, color: '#141B2D', outline: 0, marginBottom: 16 }} />

          <label style={{ fontSize: 12, fontWeight: 700, color: '#141B2D', display: 'block', marginBottom: 7 }}>Exact location <span style={{ color: '#C4320A' }}>*</span></label>
          <textarea value={draft.location} onChange={(e) => onLocationChange(e.target.value)} rows={2} placeholder="e.g. 6th row of the 1st tile, near the balcony door"
            style={{ width: '100%', border: '1px solid #E6E8EC', borderRadius: 11, padding: '12px 13px', fontSize: 14, color: '#141B2D', outline: 0, resize: 'none', lineHeight: 1.4 }} />

          {sheetError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#C4320A', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
              <i className="ph-fill ph-warning-circle" />{sheetError}
            </div>
          )}
        </div>
        <div style={{ padding: '12px 20px 18px', borderTop: '1px solid #EDEFF2', display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0 }}>
          <button className="btn-primary" style={{ height: 52 }} onClick={onSave}>Save issue</button>
          <button className="btn-secondary" style={{ height: 48 }} onClick={onSaveAndAnother}>Save & add another</button>
        </div>
      </div>
    </>
  )
}
