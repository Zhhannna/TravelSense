import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const r = await authApi.login(form)
      login(r.data.access_token, r.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px' }}>
      <div style={{ textAlign:'center', marginBottom:44 }}>
        <div style={{ fontSize:64, marginBottom:14 }}>✈️</div>
        <h1 style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.6px' }}>TravelSense+</h1>
        <p style={{ color:'var(--text3)', marginTop:8, fontSize:16 }}>Your smart travel companion</p>
      </div>

      {error && (
        <div style={{ background:'rgba(255,59,48,0.1)', color:'var(--red)', padding:'12px 16px', borderRadius:12, marginBottom:20, fontSize:15, textAlign:'center', fontWeight:500 }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div className="group">
          <div className="group-row">
            <label className="group-label">Email</label>
            <input className="group-value" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required autoComplete="email" style={{ fontSize:17 }} />
          </div>
          <div className="group-row">
            <label className="group-label">Password</label>
            <input className="group-value" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required autoComplete="current-password" style={{ fontSize:17 }} />
          </div>
        </div>

        <button type="submit" className="btn btn-blue" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign:'center', marginTop:28, color:'var(--text3)', fontSize:16 }}>
        No account?{' '}
        <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one</Link>
      </p>
    </div>
  )
}
