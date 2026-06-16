import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../services/api'
import { useAuthStore, useToast } from '../store'

const CLIMATES   = ['any','warm','cold']
const CONTS      = ['any','Europe','Asia','Americas','Africa','Oceania']
const TYPES      = ['any','city','beach','mountain','nature','cultural']

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const { show } = useToast()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) userApi.getPrefs(user.id).then((r) => setPrefs(r.data))
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      await userApi.updatePrefs(user.id, {
        max_budget: prefs.max_budget,
        preferred_climate: prefs.preferred_climate,
        preferred_continent: prefs.preferred_continent,
        preferred_travel_type: prefs.preferred_travel_type,
      })
      show('✓ Saved')
    } catch { show('Failed to save') }
    finally { setSaving(false) }
  }

  const avatarHue = ((user?.username?.charCodeAt(0) || 65) * 19) % 360

  return (
    <div className="page">
      {/* Avatar */}
      <div style={{ padding:'56px 16px 0', textAlign:'center', marginBottom:28 }}>
        <div style={{
          width:82, height:82, borderRadius:41, margin:'0 auto 12px',
          background:`linear-gradient(135deg,hsl(${avatarHue},62%,56%),hsl(${(avatarHue+70)%360},66%,42%))`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:34, color:'#fff', fontWeight:700,
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <h1 style={{ fontSize:22, fontWeight:700 }}>{user?.username}</h1>
        <p style={{ color:'var(--text3)', fontSize:14, marginTop:3 }}>{user?.email}</p>
        <span style={{
          display:'inline-block', marginTop:10, padding:'3px 14px', borderRadius:99, fontSize:12, fontWeight:600,
          background: user?.role === 'admin' ? 'rgba(175,82,222,.12)' : 'rgba(0,122,255,.1)',
          color: user?.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
        }}>
          {user?.role === 'admin' ? '⚙️ Admin' : '👤 Member'}
        </span>
      </div>

      {prefs && (
        <>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.04em', padding:'0 16px', marginBottom:6 }}>
            Travel Preferences
          </p>
          <div className="group" style={{ margin:'0 16px 16px' }}>
            <div className="group-row">
              <span className="group-label">Max budget</span>
              <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end' }}>
                <input type="number" value={prefs.max_budget} onChange={(e) => setPrefs({ ...prefs, max_budget: Number(e.target.value) })}
                  style={{ textAlign:'right', width:80, color:'var(--text3)', fontSize:17 }} />
                <span style={{ color:'var(--text3)', fontSize:15 }}>€</span>
              </div>
            </div>
            {[
              { label:'Climate', key:'preferred_climate', opts: CLIMATES },
              { label:'Continent', key:'preferred_continent', opts: CONTS },
              { label:'Travel type', key:'preferred_travel_type', opts: TYPES },
            ].map(({ label, key, opts }) => (
              <div className="group-row" key={key}>
                <span className="group-label">{label}</span>
                <select className="group-value" value={prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.value })}
                  style={{ fontSize:17, cursor:'pointer' }}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ padding:'0 16px', marginBottom:24 }}>
            <button className="btn btn-blue" onClick={save} disabled={saving}>
              {saving ? <span className="spinner" /> : '✓  Save Preferences'}
            </button>
          </div>
        </>
      )}

      <p style={{ fontSize:13, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.04em', padding:'0 16px', marginBottom:6 }}>
        Account
      </p>
      <div className="group" style={{ margin:'0 16px 24px' }}>
        <div className="group-row">
          <span className="group-label">Member since</span>
          <span className="group-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB',{year:'numeric',month:'short'}) : '—'}</span>
        </div>
        <div className="group-row">
          <span className="group-label">Role</span>
          <span className="group-value" style={{ textTransform:'capitalize' }}>{user?.role}</span>
        </div>
      </div>

      <div style={{ padding:'0 16px', marginBottom:32 }}>
        <button className="btn btn-red" onClick={() => { logout(); navigate('/login', { replace:true }) }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
