import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { recApi, userApi } from '../services/api'
import { useAuthStore, useToast, useOffline } from '../store'

const TYPE_EMOJI = { beach:'🏖️', city:'🏙️', mountain:'⛰️', nature:'🌿', cultural:'🏛️' }

function ScoreBadge({ s }) {
  const cls = s >= 75 ? 'score-hi' : s >= 55 ? 'score-mid' : 'score-lo'
  return <div className={`score ${cls}`}>{Math.round(s)}</div>
}

function Card({ d, fav, onToggle }) {
  const hue = (d.id * 47) % 360
  return (
    <div className="card" style={{ marginBottom:12 }}>
      <div style={{
        height:140,
        background:`linear-gradient(145deg,hsl(${hue},62%,52%),hsl(${(hue+80)%360},66%,36%))`,
        position:'relative', display:'flex', alignItems:'flex-end', padding:'12px 14px',
      }}>
        <div style={{ position:'absolute', top:12, right:12 }}>
          <ScoreBadge s={d.travel_score || 60} />
        </div>
        <div>
          <h2 style={{ color:'#fff', fontSize:22, fontWeight:700, letterSpacing:'-0.3px', textShadow:'0 1px 6px rgba(0,0,0,.35)' }}>{d.name}</h2>
          <p style={{ color:'rgba(255,255,255,.82)', fontSize:13 }}>{d.country} · {d.continent}</p>
        </div>
      </div>
      <div style={{ padding:'12px 14px 14px' }}>
        <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.55, marginBottom:10 }}>{d.description}</p>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
          <span className="chip chip-blue">{TYPE_EMOJI[d.travel_type]} {d.travel_type}</span>
          {d.avg_flight_price > 0 && <span className="chip chip-orange">✈ ~{d.avg_flight_price} {d.currency_code}</span>}
          {d.weather_summary && <span className="chip chip-gray">☀ {d.weather_summary}</span>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link to={`/destinations/${d.id}`} style={{ flex:1 }}>
            <button className="btn btn-gray btn-sm" style={{ width:'100%' }}>Details</button>
          </Link>
          <button onClick={() => onToggle(d.id, fav)} style={{
            width:38, height:36, borderRadius:10, fontSize:19,
            background: fav ? 'rgba(255,59,48,.1)' : 'rgba(120,120,128,.1)',
            color: fav ? 'var(--red)' : 'var(--text3)',
          }}>{fav ? '♥' : '♡'}</button>
        </div>
      </div>
    </div>
  )
}

function Skel() {
  return (
    <div className="card" style={{ marginBottom:12 }}>
      <div className="skel" style={{ height:140 }} />
      <div style={{ padding:'12px 14px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        <div className="skel" style={{ height:14, width:'55%' }} />
        <div className="skel" style={{ height:14, width:'75%' }} />
        <div className="skel" style={{ height:36, borderRadius:10, marginTop:4 }} />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuthStore()
  const { show } = useToast()
  const { cachedRecs, cacheRecs, isOnline } = useOffline()
  const [recs, setRecs] = useState(cachedRecs)
  const [favIds, setFavIds] = useState(new Set())
  const [loading, setLoading] = useState(!cachedRecs.length)

  useEffect(() => {
    if (!isOnline) { setLoading(false); return }
    Promise.all([recApi.get(5), userApi.getFavs(user.id)])
      .then(([r, f]) => {
        setRecs(r.data); cacheRecs(r.data)
        setFavIds(new Set(f.data.map((x) => x.destination.id)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (id, isFav) => {
    try {
      if (isFav) { await userApi.removeFav(user.id, id); setFavIds((s) => { const n=new Set(s); n.delete(id); return n }); show('Removed') }
      else        { await userApi.addFav(user.id, id);    setFavIds((s) => new Set([...s, id]));                          show('♥ Saved!') }
    } catch {}
  }

  return (
    <div className="page">
      <div style={{ padding:'56px 16px 8px' }}>
        <p style={{ color:'var(--text3)', fontSize:14 }}>Hello, {user?.username} 👋</p>
        <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', marginTop:3 }}>Top picks for you</h1>
        {!isOnline && (
          <div style={{ marginTop:10, padding:'8px 12px', borderRadius:10, background:'rgba(255,149,0,.1)', color:'var(--orange)', fontSize:13, fontWeight:500 }}>
            📵 Offline — showing cached results
          </div>
        )}
      </div>
      <div style={{ padding:'4px 16px 0' }}>
        {loading
          ? [1,2,3].map((i) => <Skel key={i} />)
          : recs.length
            ? recs.map((d) => <Card key={d.id} d={d} fav={favIds.has(d.id)} onToggle={toggle} />)
            : <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)' }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🌍</div>
                <p style={{ fontSize:17, fontWeight:600, color:'var(--text2)' }}>No recommendations yet</p>
                <p style={{ fontSize:14, marginTop:6 }}>Explore destinations below</p>
              </div>
        }
      </div>
    </div>
  )
}
