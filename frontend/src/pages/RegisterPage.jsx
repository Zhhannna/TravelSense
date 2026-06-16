import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store'

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password needs at least 6 characters'); return }
    setError(''); setLoading(true)
    try {
      const r = await authApi.register(form)
      login(r.data.access_token, r.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px' }}>
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🌍</div>
        <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px' }}>Create Account</h1>
        <p style={{ color:'var(--text3)', marginTop:8, fontSize:15 }}>Start discovering amazing places</p>
      </div>

      {error && (
        <div style={{ background:'rgba(255,59,48,0.1)', color:'var(--red)', padding:'12px 16px', borderRadius:12, marginBottom:20, fontSize:15, textAlign:'center', fontWeight:500 }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div className="group">
          <div className="group-row">
            <label className="group-label">Name</label>
            <input className="group-value" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="yourname" required autoComplete="username" style={{ fontSize:17 }} />
          </div>
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
              placeholder="At least 6 characters" required style={{ fontSize:17 }} />
          </div>
        </div>

        <button type="submit" className="btn btn-blue" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign:'center', marginTop:28, color:'var(--text3)', fontSize:16 }}>
        Have an account?{' '}
        <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign In</Link>
      </p>
    </div>
  )
}
