import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { destApi, userApi } from '../services/api'
import { useAuthStore, useToast } from '../store'

const T_ICON = { beach:'🏖️', city:'🏙️', mountain:'⛰️', nature:'🌿', cultural:'🏛️' }

export default function DestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { show } = useToast()
  const [dest, setDest] = useState(null)
  const [fav,  setFav]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [fl, setFl] = useState(false)

  useEffect(() => {
    destApi.get(id).then((r) => { setDest(r.data); setLoading(false) }).catch(() => setLoading(false))
    if (user) userApi.getFavs(user.id).then((r) => setFav(r.data.some((x) => x.destination.id === Number(id))))
  }, [id])

  const toggle = async () => {
    setFl(true)
    try {
      if (fav) { await userApi.removeFav(user.id, id); setFav(false); show('Removed from saved') }
      else      { await userApi.addFav(user.id, id);   setFav(true);  show('♥ Saved!') }
    } catch {} finally { setFl(false) }
  }

  if (loading) return (
    <div className="page"><div style={{ padding:'0 16px 16px' }}>
      <div className="skel" style={{ height:240, borderRadius:0 }} />
      <div style={{ padding:'16px' }}><div className="skel" style={{ height:18, width:'50%', marginBottom:12 }} /><div className="skel" style={{ height:14, width:'75%' }} /></div>
    </div></div>
  )
  if (!dest) return (
    <div className="page" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
      <div style={{ fontSize:52 }}>😕</div>
      <p style={{ fontSize:18, fontWeight:600 }}>Not found</p>
      <button className="btn btn-gray btn-sm" style={{ width:120 }} onClick={() => navigate(-1)}>Go back</button>
    </div>
  )

  const hue = (dest.id * 47) % 360

  return (
    <div className="page">
      <div style={{ position:'relative' }}>
        <div style={{
          height:250,
          background:`linear-gradient(155deg,hsl(${hue},62%,52%),hsl(${(hue+80)%360},66%,34%))`,
          display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'16px 20px',
        }}>
          <button onClick={() => navigate(-1)} style={{
            position:'absolute', top:52, left:16,
            width:36, height:36, borderRadius:99, background:'rgba(0,0,0,.28)',
            color:'#fff', fontSize:22, display:'flex', alignItems:'center', justifyContent:'center',
          }}>‹</button>
          <button onClick={toggle} disabled={fl} style={{
            position:'absolute', top:52, right:16,
            width:36, height:36, borderRadius:99,
            background: fav ? 'rgba(255,59,48,.75)' : 'rgba(0,0,0,.28)',
            color:'#fff', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
          }}>{fav ? '♥' : '♡'}</button>
          <h1 style={{ color:'#fff', fontSize:30, fontWeight:700, letterSpacing:'-0.5px', textShadow:'0 2px 8px rgba(0,0,0,.3)' }}>{dest.name}</h1>
          <p style={{ color:'rgba(255,255,255,.82)', fontSize:15, marginTop:2 }}>{dest.country} · {dest.continent}</p>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
          <span className="chip chip-blue">{T_ICON[dest.travel_type]} {dest.travel_type}</span>
          {dest.avg_flight_price > 0 && <span className="chip chip-orange">✈ ~{dest.avg_flight_price} {dest.currency_code}</span>}
          <span className="chip chip-purple">💱 {dest.currency_code}</span>
        </div>

        {dest.description && (
          <div style={{ marginBottom:22 }}>
            <h2 style={{ fontSize:17, fontWeight:600, marginBottom:8 }}>About</h2>
            <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.65 }}>{dest.description}</p>
          </div>
        )}

        <h2 style={{ fontSize:17, fontWeight:600, marginBottom:10 }}>Details</h2>
        <div className="group" style={{ marginBottom:22 }}>
          {[
            ['Continent',    dest.continent],
            ['Type',         `${T_ICON[dest.travel_type]} ${dest.travel_type}`],
            ['Flight price', dest.avg_flight_price ? `~${dest.avg_flight_price} ${dest.currency_code}` : 'N/A'],
            ['Currency',     dest.currency_code],
            ['Coordinates',  `${dest.lat?.toFixed(2)}°, ${dest.lon?.toFixed(2)}°`],
          ].map(([l, v]) => (
            <div className="group-row" key={l}>
              <span className="group-label" style={{ color:'var(--text)' }}>{l}</span>
              <span className="group-value" style={{ textTransform:'capitalize' }}>{v}</span>
            </div>
          ))}
        </div>

        <button onClick={toggle} disabled={fl} className={`btn ${fav ? 'btn-red' : 'btn-blue'}`}>
          {fl ? <span className="spinner" style={fav ? { borderColor:'rgba(255,59,48,.3)', borderTopColor:'var(--red)' } : {}} />
              : fav ? '♥  Remove from Saved' : '♡  Save Destination'}
        </button>
      </div>
    </div>
  )
}
