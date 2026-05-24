import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signIn, signUp, user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      if (profile?.onboarding_complete) navigate('/dashboard')
      else navigate('/onboarding')
    }
  }, [user, profile])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) setError(error.message)
        else setMessage('Check your email to confirm your account, then sign in.')
      } else {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      }
    } catch (err) {
      setError('Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', padding:24,
    }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40, justifyContent:'center' }}>
          <div style={{ width:36, height:36, background:'var(--accent)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={20} color="#0a0a0f" fill="#0a0a0f" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem' }}>FitAI</span>
        </Link>

        <div className="card" style={{ padding:32 }}>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, marginBottom:6 }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:28 }}>
            {mode === 'signup' ? 'Start your fitness journey today.' : 'Sign in to continue.'}
          </p>

          {error && (
            <div style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.3)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:20, fontSize:'0.85rem', color:'var(--red)' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.3)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:20, fontSize:'0.85rem', color:'var(--accent)' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'block', marginBottom:6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{
                  width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)',
                  fontSize:'0.9rem', transition:'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor='var(--accent)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
            </div>
            <div>
              <label style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'block', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{
                    width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)',
                    borderRadius:'var(--radius-sm)', padding:'10px 40px 10px 14px', color:'var(--text)',
                    fontSize:'0.9rem',
                  }}
                  onFocus={e => e.target.style.borderColor='var(--accent)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', color:'var(--text-3)',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }} disabled={loading}>
              {loading ? <div className="spinner" /> : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'var(--text-3)' }}>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setMessage('') }}
              style={{ background:'none', color:'var(--accent)', fontWeight:600 }}>
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
