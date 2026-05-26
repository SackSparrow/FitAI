import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Component } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import FoodTracker from './pages/FoodTracker'
import NutritionAI from './pages/NutritionAI'
import Progress from './pages/Progress'
import AppLayout from './components/AppLayout'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:16, padding:24 }}>
        <div style={{ fontSize:'2rem' }}>⚠️</div>
        <h2 style={{ fontFamily:'var(--font-display)', color:'var(--text)' }}>Something went wrong</h2>
        <p style={{ color:'var(--text-3)', fontSize:'0.875rem', maxWidth:400, textAlign:'center' }}>{this.state.error?.message}</p>
        <button onClick={() => window.location.href = '/'} style={{ background:'var(--accent)', color:'#07070f', padding:'10px 24px', borderRadius:12, fontWeight:700, cursor:'pointer', border:'none', marginTop:8 }}>
          Go home
        </button>
      </div>
    )
    return this.props.children
  }
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div className="spinner" style={{ width:32, height:32 }} />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  if (profile?.onboarding_complete) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="food" element={<FoodTracker />} />
        <Route path="ai-coach" element={<NutritionAI />} />
        <Route path="progress" element={<Progress />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
