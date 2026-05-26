import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Utensils, Bot, TrendingUp, LogOut, Activity } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/food',      icon: Utensils,        label: 'Food'      },
  { to: '/ai-coach',  icon: Bot,             label: 'AI Coach'  },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress'  },
]

export default function AppLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '?'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 'var(--sidebar-w)',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          padding: '28px 22px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 11,
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--accent)',
            borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(200,245,90,0.3)',
          }}>
            <Activity size={20} color="#07070f" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', lineHeight:1 }}>
              Calor<span style={{ color:'var(--accent)' }}>IQ</span>
            </div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-3)', marginTop:2, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Nutrition AI
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 12px', display:'flex', flexDirection:'column', gap:3 }}>
          <div style={{ fontSize:'0.65rem', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px', marginBottom:8 }}>
            Menu
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              onMouseEnter={() => setHoveredItem(to)}
              onMouseLeave={() => setHoveredItem(null)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--accent)' : hoveredItem === to ? 'var(--text)' : 'var(--text-2)',
                background: isActive ? 'var(--accent-dim)' : hoveredItem === to ? 'rgba(255,255,255,0.04)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease',
                borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                position: 'relative',
              })}>
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
              {to === '/ai-coach' && (
                <span style={{
                  marginLeft:'auto', fontSize:'0.6rem', fontWeight:700,
                  background:'var(--blue-dim)', color:'var(--blue)',
                  border:'1px solid rgba(90,143,255,0.25)',
                  padding:'2px 7px', borderRadius:100, letterSpacing:'0.05em',
                }}>AI</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding:'16px 12px', borderTop:'1px solid var(--border)' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 12px', borderRadius:'var(--radius-sm)',
            background:'var(--bg-3)', marginBottom:8,
          }}>
            <div style={{
              width:32, height:32, borderRadius:50,
              background:'linear-gradient(135deg, var(--accent) 0%, var(--teal) 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.75rem', fontWeight:800, color:'#07070f', flexShrink:0,
            }}>{initials}</div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {profile?.name || 'User'}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-3)', textTransform:'capitalize' }}>
                {profile?.goal?.replace(/_/g,' ') || 'Getting started'}
              </div>
            </div>
          </div>
          <button onClick={handleSignOut}
            style={{
              display:'flex', alignItems:'center', gap:10,
              width:'100%', padding:'9px 12px',
              background:'transparent', color:'var(--text-3)',
              borderRadius:'var(--radius-sm)', fontSize:'0.82rem',
              transition:'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='var(--red-dim)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.background='transparent'; }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, overflow:'auto', background:'var(--bg)', minHeight:'100vh' }}>
        <div key={location.pathname} className="anim-fade-up" style={{ minHeight:'100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
