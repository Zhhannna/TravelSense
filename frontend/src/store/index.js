import { create } from 'zustand'

const parse = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export const useAuthStore = create((set) => ({
  user: parse('ts_user', null),
  token: localStorage.getItem('ts_token') || null,
  login: (token, user) => {
    localStorage.setItem('ts_token', token)
    localStorage.setItem('ts_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('ts_token')
    localStorage.removeItem('ts_user')
    set({ token: null, user: null })
  },
}))

export const useToast = create((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg })
    setTimeout(() => set({ msg: null }), 2000)
  },
}))

export const useOffline = create((set) => ({
  cachedRecs: parse('ts_recs', []),
  isOnline: navigator.onLine,
  setOnline: (v) => set({ isOnline: v }),
  cacheRecs: (recs) => {
    localStorage.setItem('ts_recs', JSON.stringify(recs))
    set({ cachedRecs: recs })
  },
}))
