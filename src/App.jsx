import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import FoodTracker from './pages/FoodTracker'
import NutritionAI from './pages/NutritionAI'
import Progress from './pages/Progress'
import AppLayout from './components/AppLayout'

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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
