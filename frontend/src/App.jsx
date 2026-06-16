import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore, useToast, useOffline } from './store'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage     from './pages/HomePage'
import ExplorePage  from './pages/ExplorePage'
import DestPage     from './pages/DestPage'
import FavsPage     from './pages/FavsPage'
import ProfilePage  from './pages/ProfilePage'

function Nav() {
  const { user } = useAuthStore()
  const { pathname } = useLocation()
  if (!user) return null
  const items = [
    { to: '/',        icon: '✈️', label: 'Home' },
    { to: '/explore', icon: '🔍', label: 'Explore' },
    { to: '/favs',    icon: '♥',  label: 'Saved' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ]
  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon, label }) => {
        const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
        return (
          <Link key={to} to={to} className={`nav-item${active ? ' active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function Toast() {
  const { msg } = useToast()
  return msg ? <div className="toast">{msg}</div> : null
}

function Guard({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { setOnline } = useOffline()
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/"         element={<Guard><HomePage /></Guard>} />
        <Route path="/explore"  element={<Guard><ExplorePage /></Guard>} />
        <Route path="/destinations/:id" element={<Guard><DestPage /></Guard>} />
        <Route path="/favs"     element={<Guard><FavsPage /></Guard>} />
        <Route path="/profile"  element={<Guard><ProfilePage /></Guard>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
      <Nav />
    </BrowserRouter>
  )
}
