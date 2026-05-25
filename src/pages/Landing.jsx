import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ChevronRight, Check, Zap, Brain, Utensils, TrendingUp, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: Utensils, color:'var(--accent)', bg:'var(--accent-dim)', title:'200+ Foods Database', desc:'Indian brands, supplements, restaurant items, packaged foods. Find MaxProtein bars, MuscleBlaze, Yoga Bar and more.' },
  { icon: Brain, color:'var(--blue)', bg:'var(--blue-dim)', title:'AI Nutrition Coach', desc:'Context-aware AI that knows your remaining macros and suggests the perfect meal to hit your goals.' },
  { icon: TrendingUp, color:'var(--purple)', bg:'var(--purple-dim)', title:'Progress Tracking', desc:'Weight charts, calorie history, streak tracking. See your journey visually and stay motivated every day.' },
]

const PERKS = [
  'Personalised calorie & macro goals',
  'AI meal suggestions for your budget',
  'Daily streak tracking',
  'Weight progress charts',
  'Indian & supplement food database',
  'Works on any device, completely free',
]

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = target / 60
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', overflowX:'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 48px',
        position:'sticky', top:0, zIndex:100,
        background: scrolled ? 'rgba(7,7,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition:'all 0.3s ease',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'var(--accent)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(200,245,90,0.35)' }}>
            <Activity size={18} color="#07070f" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>
            Calor<span style={{ color:'var(--accent)' }}>IQ</span>
          </span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-ghost" style={{ padding:'9px 18px' }} onClick={() => navigate('/auth')}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate('/auth?mode=signup')}>
            Get started <ChevronRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding:'90px 48px 70px', maxWidth:1140, margin:'0 auto', position:'relative' }}>
        {/* Background glow blobs */}
        <div style={{ position:'absolute', top:-80, left:'20%', width:500, height:500, background:'radial-gradient(circle, rgba(200,245,90,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:100, right:'10%', width:400, height:400, background:'radial-gradient(circle, rgba(90,143,255,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="anim-fade-up" style={{ textAlign:'center', position:'relative' }}>
          <div className="tag anim-scale-in" style={{ marginBottom:28, animationDelay:'100ms' }}>
            <Zap size={11} color="var(--accent)" />
            <span>AI-powered nutrition intelligence</span>
          </div>

          <h1 className="anim-fade-up" style={{
            fontSize:'clamp(2.8rem, 6.5vw, 5rem)',
            fontWeight:800, lineHeight:1.04, marginBottom:26,
            animationDelay:'150ms',
          }}>
            <span className="shimmer-text">Smart tracking.</span>
            <br />
            <span style={{ color:'var(--text)' }}>Real results.</span>
          </h1>

          <p className="anim-fade-up" style={{
            fontSize:'1.1rem', color:'var(--text-2)', maxWidth:500,
            margin:'0 auto 40px', lineHeight:1.75, animationDelay:'220ms',
          }}>
            Track nutrition, get AI-driven meal suggestions, and stay consistent — all in one beautifully focused app.
          </p>

          <div className="anim-fade-up" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', animationDelay:'290ms' }}>
            <button className="btn-primary" style={{ fontSize:'0.95rem', padding:'13px 30px' }} onClick={() => navigate('/auth?mode=signup')}>
              Start for free <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" style={{ fontSize:'0.95rem', padding:'13px 24px' }} onClick={() => navigate('/auth')}>
              Sign in
            </button>
          </div>

          <p className="anim-fade-in" style={{ fontSize:'0.78rem', color:'var(--text-3)', marginTop:18, animationDelay:'400ms' }}>
            ✓ Free to use &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ 200+ Indian & global foods
          </p>
        </div>

        {/* ── DASHBOARD PREVIEW ── */}
        <div className="anim-fade-up" style={{
          marginTop:72, maxWidth:860, margin:'72px auto 0',
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)', padding:28,
          boxShadow:'0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          animationDelay:'360ms',
          position:'relative', overflow:'hidden',
        }}>
          {/* Subtle inner glow */}
          <div style={{ position:'absolute', top:0, left:'30%', width:'40%', height:1, background:'linear-gradient(90deg, transparent, rgba(200,245,90,0.3), transparent)' }} />

          {/* Mini topbar */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(255,77,109,0.6)' }} />
            <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(255,123,71,0.6)' }} />
            <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(200,245,90,0.6)' }} />
            <div style={{ flex:1, textAlign:'center', fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--font-display)' }}>
              CalorIQ — Dashboard
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14 }}>
            {[
              { label:'Remaining', value:'719', unit:'kcal', color:'var(--accent)' },
              { label:'Protein', value:'88', unit:'/ 150g', color:'var(--blue)' },
              { label:'Streak', value:'7 🔥', unit:'days', color:'var(--orange)' },
            ].map((c, i) => (
              <div key={c.label} style={{ background:'var(--bg-3)', borderRadius:12, padding:'14px 16px', animationDelay:`${400 + i*60}ms` }} className="anim-fade-up">
                <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{c.label}</div>
                <div style={{ fontSize:'1.5rem', fontFamily:'var(--font-display)', fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:3 }}>{c.unit}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--bg-3)', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-2)', marginBottom:14, fontFamily:'var(--font-display)' }}>Today's Macros</div>
            {[
              { label:'Calories', pct:67, color:'var(--accent)' },
              { label:'Protein',  pct:59, color:'var(--blue)' },
              { label:'Carbs',    pct:73, color:'var(--purple)' },
              { label:'Fats',     pct:44, color:'var(--orange)' },
            ].map((m, i) => (
              <div key={m.label} style={{ marginBottom: i < 3 ? 13 : 0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'var(--text-2)', marginBottom:5 }}>
                  <span>{m.label}</span>
                  <span style={{ color:m.color, fontWeight:600 }}>{m.pct}%</span>
                </div>
                <div style={{ height:5, background:'var(--bg-2)', borderRadius:6, overflow:'hidden' }}>
                  <div className="bar-animated" style={{
                    width:`${m.pct}%`, height:'100%', borderRadius:6,
                    background:`linear-gradient(90deg, ${m.color}99, ${m.color})`,
                    animationDelay:`${600 + i * 100}ms`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ padding:'0 48px 80px', maxWidth:900, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border)' }}>
          {[
            { num:50, suffix:'K+', label:'Active users' },
            { num:200, suffix:'+', label:'Foods in database' },
            { num:94, suffix:'%', label:'Goal completion rate' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding:'28px 24px', textAlign:'center',
              background:'var(--bg-2)',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize:'2.2rem', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--accent)', lineHeight:1 }}>
                <AnimatedCounter target={s.num} suffix={s.suffix} />
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding:'40px 48px 80px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:12 }}>Everything you need</h2>
          <p style={{ color:'var(--text-2)', fontSize:'0.95rem' }}>No more juggling five different apps.</p>
        </div>
        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:20 }}>
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="card card-hover anim-fade-up" style={{ padding:28 }}>
              <div style={{ width:46, height:46, background:bg, border:`1px solid ${color}33`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:10 }}>{title}</h3>
              <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.68 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PERKS ── */}
      <section style={{ padding:'20px 48px 100px', maxWidth:720, margin:'0 auto', textAlign:'center' }}>
        <h2 style={{ fontSize:'1.9rem', fontWeight:800, marginBottom:40 }}>Built for real goals.</h2>
        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, textAlign:'left', marginBottom:48 }}>
          {PERKS.map(p => (
            <div key={p} className="anim-slide-right" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:22, height:22, background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.25)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Check size={12} color="var(--accent)" />
              </div>
              <span style={{ fontSize:'0.875rem', color:'var(--text-2)' }}>{p}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ fontSize:'0.95rem', padding:'13px 34px' }} onClick={() => navigate('/auth?mode=signup')}>
          Get started free <ArrowRight size={16} />
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'22px 48px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Activity size={14} color="var(--accent)" />
          <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', fontWeight:800 }}>
            Calor<span style={{ color:'var(--accent)' }}>IQ</span>
          </span>
        </div>
        <span style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>© 2026 CalorIQ. All rights reserved.</span>
      </footer>
    </div>
  )
}
