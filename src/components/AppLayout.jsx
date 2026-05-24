import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Utensils, Bot, TrendingUp, LogOut, Zap } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/food', icon: Utensils, label: 'Food' },
  { to: '/ai-coach', icon: Bot, label: 'AI Coach' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
]

export default function AppLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 32px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--accent)',
            borderRadius: 10,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Zap size={18} color="#0a0a0f" fill="#0a0a0f" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>FitAI</span>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'0 12px', display:'flex', flexDirection:'column', gap:4 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.15s ease',
            })}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / signout */}
        <div style={{ padding:'0 12px', borderTop:'1px solid var(--border)', paddingTop:16, marginTop:16 }}>
          <div style={{ padding:'0 12px 12px', fontSize:'0.8rem', color:'var(--text-3)' }}>
            {profile?.name || 'Your Profile'}
          </div>
          <button onClick={handleSignOut} style={{
            display:'flex', alignItems:'center', gap:10,
            width:'100%', padding:'10px 12px',
            background:'transparent', color:'var(--text-3)',
            borderRadius:'var(--radius-sm)',
            fontSize:'0.85rem',
            transition:'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='rgba(255,77,109,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.background='transparent' }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflow:'auto', background:'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
