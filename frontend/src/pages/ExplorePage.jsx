import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { destApi } from '../services/api'

const CONTS  = ['', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania']
const TYPES  = ['', 'city', 'beach', 'mountain', 'nature', 'cultural']
const T_ICON = { beach:'🏖️', city:'🏙️', mountain:'⛰️', nature:'🌿', cultural:'🏛️' }

export default function ExplorePage() {
  const [items, setItems] = useState([])
  const [meta,  setMeta]  = useState({ total:0, pages:1 })
  const [f, setF] = useState({ continent:'', travel_type:'', page:1, limit:12 })
  const [loading, setLoading] = useState(true)

  const load = async (params) => {
    setLoading(true)
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== ''))
      const r = await destApi.list(clean)
      setItems(r.data.items); setMeta({ total:r.data.total, pages:r.data.pages })
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load(f) }, [])

  const set = (key, val) => { const nf = { ...f, [key]:val, page:1 }; setF(nf); load(nf) }
  const setPage = (p) => { const nf = { ...f, page:p }; setF(nf); load(nf) }

  return (
    <div className="page">
      <div style={{ padding:'56px 16px 12px' }}>
        <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px' }}>Explore</h1>
        <p style={{ color:'var(--text3)', fontSize:14, marginTop:2 }}>{meta.total} destinations worldwide</p>
      </div>

      {/* Continent pills */}
      <div style={{ overflowX:'auto', display:'flex', gap:8, padding:'0 16px 10px', scrollbarWidth:'none' }}>
        {CONTS.map((c) => (
          <button key={c} className={`pill${f.continent===c?' pill-active':''}`} onClick={() => set('continent', c)}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {/* Type pills */}
      <div style={{ overflowX:'auto', display:'flex', gap:8, padding:'0 16px 12px', scrollbarWidth:'none' }}>
        {TYPES.map((t) => (
          <button key={t} className={`pill${f.travel_type===t?' pill-active':''}`} onClick={() => set('travel_type', t)}>
            {t ? `${T_ICON[t]} ${t}` : '✨ All types'}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[1,2,3,4].map((i) => <div key={i} className="skel" style={{ height:150, borderRadius:14 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
            <p style={{ fontWeight:600 }}>No results</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {items.map((d) => (
              <Link key={d.id} to={`/destinations/${d.id}`}>
                <div className="card" style={{ cursor:'pointer' }}>
                  <div style={{
                    height:90,
                    background:`linear-gradient(135deg,hsl(${(d.id*53)%360},60%,55%),hsl(${(d.id*53+90)%360},65%,40%))`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:30,
                  }}>
                    {T_ICON[d.travel_type] || '🌐'}
                  </div>
                  <div style={{ padding:'10px 10px 12px' }}>
                    <p style={{ fontWeight:600, fontSize:15 }}>{d.name}</p>
                    <p style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{d.country}</p>
                    {d.avg_flight_price > 0 && (
                      <p style={{ fontSize:12, color:'var(--orange)', marginTop:4, fontWeight:500 }}>~{d.avg_flight_price} {d.currency_code}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta.pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:10, padding:'16px 0' }}>
            <button className="btn btn-gray btn-sm" style={{ width:80 }} onClick={() => setPage(f.page-1)} disabled={f.page<=1}>← Prev</button>
            <span style={{ alignSelf:'center', fontSize:14, color:'var(--text3)' }}>{f.page} / {meta.pages}</span>
            <button className="btn btn-gray btn-sm" style={{ width:80 }} onClick={() => setPage(f.page+1)} disabled={f.page>=meta.pages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
