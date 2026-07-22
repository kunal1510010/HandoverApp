const TOKEN_KEY = 'asbl_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Token ${token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  const res = await fetch(`/api/${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    setToken(null)
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `request failed: ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  sendOtp: (customer_number) => request('auth/otp', { method: 'POST', body: { customer_number } }),
  verifyOtp: (customer_number, otp) =>
    request('auth/verify', { method: 'POST', body: { customer_number, otp } }),
  getUnit: () => request('unit'),
  getChecklist: () => request('checklist'),
  getInspection: () => request('inspection'),
  createInspection: (payload) => request('inspection', { method: 'POST', body: payload }),
  patchInspection: (id, payload) => request(`inspection/${id}`, { method: 'PATCH', body: payload }),
  uploadPhoto: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('media/upload', { method: 'POST', body: form, isForm: true })
  },
  submitInspection: (id) => request(`inspection/${id}/submit`, { method: 'POST' }),
}
