import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff, ArrowRight } from 'lucide-react'

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
        else setMessage('Account created! Check your email or sign in below.')
      } else {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      }
    } catch { setError('Something went wrong.') }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      background:'var(--bg)',
      overflow:'hidden', position:'relative',
    }}>
      {/* Background glows */}
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:600, height:600, background:'radial-gradient(circle, rgba(200,245,90,0.05) 0%, transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, background:'radial-gradient(circle, rgba(90,143,255,0.05) 0%, transparent 65%)', pointerEvents:'none' }} />

      {/* Left panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px', borderRight:'1px solid var(--border)', position:'relative', background:'var(--bg)', minHeight:'100vh' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:60 }}>
          <div style={{ width:34, height:34, background:'var(--accent)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(200,245,90,0.3)' }}>
            <Activity size={18} color="#07070f" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>
            Calor<span style={{ color:'var(--accent)' }}>IQ</span>
          </span>
        </Link>

        <div className="anim-fade-up">
          <h2 style={{ fontSize:'2.2rem', fontWeight:800, lineHeight:1.1, marginBottom:16 }}>
            Your nutrition.<br />
            <span className="shimmer-text">Intelligently tracked.</span>
          </h2>
          <p style={{ color:'var(--text-2)', fontSize:'0.95rem', lineHeight:1.75, maxWidth:380 }}>
            Join thousands tracking smarter. AI-powered meal suggestions, 200+ foods, and beautiful progress charts.
          </p>
        </div>

        {/* Mini preview cards */}
        <div className="stagger" style={{ marginTop:52, display:'flex', flexDirection:'column', gap:12, maxWidth:340 }}>
          {[
            { emoji:'🥗', text:'Logged lunch — 520 kcal', sub:'580 remaining', color:'var(--accent)' },
            { emoji:'🤖', text:'AI suggestion ready', sub:'Try grilled chicken + rice', color:'var(--blue)' },
            { emoji:'📈', text:'7-day streak!', sub:'Best week yet', color:'var(--orange)' },
          ].map((item, i) => (
            <div key={i} className="card anim-fade-up" style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, animationDelay:`${200 + i * 80}ms` }}>
              <span style={{ fontSize:'1.3rem' }}>{item.emoji}</span>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:600 }}>{item.text}</div>
                <div style={{ fontSize:'0.72rem', color:item.color, marginTop:2 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width:480, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div className="anim-scale-in" style={{ width:'100%', maxWidth:400 }}>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:32 }}>
            {mode === 'signup' ? 'Start your calorie tracking journey.' : 'Sign in to continue to CalorIQ.'}
          </p>

          {error && (
            <div style={{ background:'var(--red-dim)', border:'1px solid rgba(255,77,109,0.25)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:20, fontSize:'0.84rem', color:'var(--red)' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.25)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:20, fontSize:'0.84rem', color:'var(--accent)' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ fontSize:'0.78rem', color:'var(--text-2)', display:'block', marginBottom:7, fontWeight:500 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="input-field"
                onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
              />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', color:'var(--text-2)', display:'block', marginBottom:7, fontWeight:500 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingRight:42 }}
                  onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', color:'var(--text-3)', transition:'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'0.9rem', marginTop:4 }} disabled={loading}>
              {loading ? <div className="spinner" /> : <>{mode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:22, fontSize:'0.84rem', color:'var(--text-3)' }}>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setMessage('') }}
              style={{ background:'none', color:'var(--accent)', fontWeight:600, transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--accent)'}
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
