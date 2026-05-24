import { useNavigate } from 'react-router-dom'
import { Zap, Brain, Utensils, TrendingUp, ChevronRight, Check } from 'lucide-react'

const features = [
  { icon: Utensils, color: 'var(--accent)', bg: 'var(--accent-dim)', title: 'Smart Food Tracking', desc: 'Log meals in seconds. Track calories, protein, carbs, and fats with a searchable food database.' },
  { icon: Brain, color: 'var(--blue)', bg: 'var(--blue-dim)', title: 'AI Nutrition Coach', desc: 'Tell it your remaining calories and it suggests the perfect meal. Context-aware, goal-driven advice.' },
  { icon: TrendingUp, color: 'var(--purple)', bg: 'var(--purple-dim)', title: 'Progress Tracking', desc: 'Visualize your weight journey, streak history, and macro trends over time with beautiful charts.' },
]

const perks = [
  'Personalized calorie & macro goals',
  'AI meal suggestions based on your goals',
  'Daily streak tracking',
  'Weight progress charts',
  'Breakfast, lunch, dinner & snack logs',
  'Works on any device',
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'20px 48px',
        borderBottom:'1px solid var(--border)',
        position:'sticky', top:0,
        background:'rgba(10,10,15,0.85)',
        backdropFilter:'blur(12px)',
        zIndex:100,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, background:'var(--accent)',
            borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Zap size={18} color="#0a0a0f" fill="#0a0a0f" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>FitAI</span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn-ghost" onClick={() => navigate('/auth')}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate('/auth?mode=signup')}>Get started <ChevronRight size={16} /></button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'100px 48px 80px', maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
        <div className="tag" style={{ marginBottom:24, margin:'0 auto 24px' }}>
          <Zap size={12} color="var(--accent)" />
          <span>Your AI-powered fitness companion</span>
        </div>
        <h1 style={{
          fontSize:'clamp(2.8rem, 6vw, 4.5rem)',
          fontWeight:800,
          lineHeight:1.05,
          marginBottom:24,
          background:'linear-gradient(135deg, #fff 0%, #9898aa 100%)',
          WebkitBackgroundClip:'text',
          WebkitTextFillColor:'transparent',
        }}>
          Hit your goals.<br />Every single day.
        </h1>
        <p style={{ fontSize:'1.15rem', color:'var(--text-2)', maxWidth:520, margin:'0 auto 40px', lineHeight:1.7 }}>
          Track nutrition, get AI-powered meal suggestions, and watch your progress — all in one clean, focused app.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn-primary" style={{ fontSize:'1rem', padding:'14px 32px' }} onClick={() => navigate('/auth?mode=signup')}>
            Start for free <ChevronRight size={18} />
          </button>
          <button className="btn-ghost" style={{ fontSize:'1rem', padding:'14px 28px' }} onClick={() => navigate('/auth')}>
            Sign in
          </button>
        </div>
      </section>

      {/* Hero visual — dashboard preview mockup */}
      <section style={{ padding:'0 48px 80px', maxWidth:960, margin:'0 auto' }}>
        <div style={{
          background:'var(--bg-card)',
          border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)',
          padding:24,
          boxShadow:'0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          {/* Mini dashboard preview */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12 }}>
            {[
              { label:'Calories', value:'1,420', max:'2,100', color:'var(--accent)' },
              { label:'Protein', value:'88g', max:'150g', color:'var(--blue)' },
              { label:'Streak', value:'7 days 🔥', color:'var(--orange)' },
            ].map(card => (
              <div key={card.label} style={{ background:'var(--bg-3)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:6 }}>{card.label}</div>
                <div style={{ fontSize:'1.4rem', fontFamily:'var(--font-display)', fontWeight:700, color:card.color }}>{card.value}</div>
                {card.max && <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:2 }}>of {card.max}</div>}
              </div>
            ))}
          </div>
          {/* Fake progress bars */}
          <div style={{ background:'var(--bg-3)', borderRadius:12, padding:16 }}>
            {[
              { label:'Calories', pct:67, color:'var(--accent)' },
              { label:'Protein', pct:58, color:'var(--blue)' },
              { label:'Carbs', pct:72, color:'var(--purple)' },
              { label:'Fats', pct:44, color:'var(--orange)' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-2)', marginBottom:5 }}>
                  <span>{m.label}</span><span>{m.pct}%</span>
                </div>
                <div style={{ height:6, background:'var(--bg)', borderRadius:6 }}>
                  <div style={{ width:`${m.pct}%`, height:'100%', borderRadius:6, background:m.color, transition:'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 48px', maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'2rem', fontWeight:800, marginBottom:12 }}>Everything you need</h2>
        <p style={{ textAlign:'center', color:'var(--text-2)', marginBottom:48 }}>No more juggling five different apps.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
          {features.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="card" style={{ padding:28 }}>
              <div style={{ width:44, height:44, background:bg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:8 }}>{title}</h3>
              <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks list */}
      <section style={{ padding:'60px 48px 100px', maxWidth:700, margin:'0 auto', textAlign:'center' }}>
        <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:40 }}>Built for real people, real goals.</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, textAlign:'left', marginBottom:48 }}>
          {perks.map(p => (
            <div key={p} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:22, height:22, background:'var(--accent-dim)', border:'1px solid var(--accent)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Check size={13} color="var(--accent)" />
              </div>
              <span style={{ fontSize:'0.875rem', color:'var(--text-2)' }}>{p}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ fontSize:'1rem', padding:'14px 36px' }} onClick={() => navigate('/auth?mode=signup')}>
          Get started free <ChevronRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'24px 48px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Zap size={14} color="var(--accent)" />
          <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', fontWeight:700 }}>FitAI</span>
        </div>
        <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>© 2026 FitAI. All rights reserved.</span>
      </footer>
    </div>
  )
}
