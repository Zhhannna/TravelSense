import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userApi } from '../services/api'
import { useAuthStore, useToast } from '../store'

const T_ICON = { beach:'🏖️', city:'🏙️', mountain:'⛰️', nature:'🌿', cultural:'🏛️' }

export default function FavsPage() {
  const { user } = useAuthStore()
  const { show } = useToast()
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    userApi.getFavs(user.id).then((r) => setFavs(r.data)).finally(() => setLoading(false))
  }, [user])

  const remove = async (destId) => {
    await userApi.removeFav(user.id, destId)
    setFavs((f) => f.filter((x) => x.destination.id !== destId))
    show('Removed')
  }

  return (
    <div className="page">
      <div style={{ padding:'56px 16px 16px' }}>
        <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px' }}>Saved Places</h1>
        <p style={{ color:'var(--text3)', fontSize:14, marginTop:3 }}>{favs.length} saved</p>
      </div>

      <div style={{ padding:'0 16px' }}>
        {loading ? (
          [1,2,3].map((i) => <div key={i} className="skel" style={{ height:72, borderRadius:14, marginBottom:10 }} />)
        ) : favs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:56, marginBottom:14 }}>♡</div>
            <p style={{ fontSize:18, fontWeight:600, color:'var(--text2)' }}>Nothing saved yet</p>
            <p style={{ fontSize:14, marginTop:6, marginBottom:28 }}>Tap ♡ on any destination to save it</p>
            <Link to="/"><button className="btn btn-blue" style={{ width:180 }}>Browse Picks</button></Link>
          </div>
        ) : (
          <div className="group">
            {favs.map(({ id, destination: d }) => (
              <div className="group-row" key={id} style={{ padding:'10px 14px' }}>
                <div style={{
                  width:46, height:46, borderRadius:12, flexShrink:0,
                  background:`linear-gradient(135deg,hsl(${(d.id*53)%360},60%,58%),hsl(${(d.id*53+90)%360},65%,43%))`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                }}>
                  {T_ICON[d.travel_type] || '🌐'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:16, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.name}</p>
                  <p style={{ fontSize:13, color:'var(--text3)', marginTop:1 }}>{d.country} · {d.travel_type}</p>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <Link to={`/destinations/${d.id}`}>
                    <button style={{ width:34, height:34, borderRadius:9, background:'rgba(0,122,255,.1)', color:'var(--accent)', fontSize:18 }}>›</button>
                  </Link>
                  <button onClick={() => remove(d.id)} style={{ width:34, height:34, borderRadius:9, background:'rgba(255,59,48,.1)', color:'var(--red)', fontSize:16, fontWeight:700 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
