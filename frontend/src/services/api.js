import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

api.interceptors.request.use((c) => {
  const t = localStorage.getItem('ts_token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ts_token')
      localStorage.removeItem('ts_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
}

export const destApi = {
  list: (p) => api.get('/destinations', { params: p }),
  get: (id) => api.get(`/destinations/${id}`),
  create: (d) => api.post('/destinations', d),
  update: (id, d) => api.put(`/destinations/${id}`, d),
  delete: (id) => api.delete(`/destinations/${id}`),
}

export const recApi = {
  get: (limit = 5) => api.get('/recommendations', { params: { limit } }),
}

export const userApi = {
  getFavs: (uid) => api.get(`/users/${uid}/favorites`),
  addFav: (uid, did) => api.post(`/users/${uid}/favorites/${did}`),
  removeFav: (uid, did) => api.delete(`/users/${uid}/favorites/${did}`),
  getPrefs: (uid) => api.get(`/users/${uid}/preferences`),
  updatePrefs: (uid, d) => api.put(`/users/${uid}/preferences`, d),
}

export default api
