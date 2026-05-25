import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFoodLog, useStreak } from '../hooks/useFoodLog'
import { useNavigate } from 'react-router-dom'
import { Flame, Droplets, Zap, TrendingUp, Plus, ChevronRight, Brain, ArrowRight } from 'lucide-react'

function MacroBar({ label, current, target, color, delay = 0 }) {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:6 }}>
        <span style={{ color:'var(--text-2)', fontWeight:500 }}>{label}</span>
        <span style={{ color, fontWeight:700 }}>{Math.round(current)}<span style={{ color:'var(--text-3)', fontWeight:400 }}>/{target}g</span></span>
      </div>
      <div style={{ height:5, background:'var(--bg-3)', borderRadius:6, overflow:'hidden' }}>
        <div className="bar-animated" style={{
          width:`${pct}%`, height:'100%', borderRadius:6,
          background:`linear-gradient(90deg, ${color}88, ${color})`,
          animationDelay:`${delay}ms`,
        }} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon: Icon, accent, delay = 0 }) {
  return (
    <div className={`card card-hover anim-fade-up ${accent ? 'card-accent' : ''}`}
      style={{ padding:20, animationDelay:`${delay}ms`, cursor:'default' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <span style={{ fontSize:'0.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>{label}</span>
        <div style={{ width:30, height:30, background:`${color}18`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${color}28` }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div className="anim-count" style={{ fontSize:'1.9rem', fontFamily:'var(--font-display)', fontWeight:800, color: accent ? 'var(--accent)' : 'var(--text)', lineHeight:1, animationDelay:`${delay + 100}ms` }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:'0.73rem', color:'var(--text-3)', marginTop:5 }}>{sub}</div>}
    </div>
  )
}

function CalorieRing({ consumed, goal }) {
  const pct = Math.min(consumed / goal, 1)
  const r = 48, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  const dash = circumference * pct
  const over = consumed > goal
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ position:'relative', width:120, height:120 }}>
        <svg width={120} height={120} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={9} />
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={over ? 'var(--red)' : 'var(--accent)'}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="ring-animated"
            style={{ filter: over ? 'none' : 'drop-shadow(0 0 6px rgba(200,245,90,0.5))' }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div className="anim-count" style={{ fontSize:'1.4rem', fontFamily:'var(--font-display)', fontWeight:800, color: over ? 'var(--red)' : 'var(--accent)', lineHeight:1 }}>
            {Math.round(consumed)}
          </div>
          <div style={{ fontSize:'0.62rem', color:'var(--text-3)', marginTop:2 }}>kcal</div>
        </div>
      </div>
      <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:8 }}>of {goal} goal</div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { user } = useAuth()
  const { totals, logs } = useFoodLog(user?.id)
  const streak = useStreak(user?.id)
  const navigate = useNavigate()
  const [water, setWater] = useState(0)

  const remaining  = Math.max(0, (profile?.calories || 2000) - totals.calories)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = profile?.name?.split(' ')[0] || 'there'

  return (
    <div style={{ padding:'32px 40px', maxWidth:1120, margin:'0 auto' }}>

      {/* ── HEADER ── */}
      <div className="anim-fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:30 }}>
        <div>
          <h1 style={{ fontSize:'1.55rem', fontWeight:800 }}>{greeting}, {name} 👋</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>
            Here's your nutrition overview for today.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/food')} style={{ gap:8 }}>
          <Plus size={15} /> Log Food
        </button>
      </div>

      {/* ── KPI ROW ── */}
      <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        <StatCard label="Streak" value={`${streak} 🔥`} sub="days in a row" color="var(--orange)" icon={Flame} delay={0} />
        <StatCard label="Remaining" value={remaining.toLocaleString()} sub="kcal left today" color="var(--accent)" icon={Zap} accent delay={60} />
        <StatCard label="Consumed" value={Math.round(totals.calories).toLocaleString()} sub={`of ${profile?.calories || 2000} goal`} color="var(--blue)" icon={TrendingUp} delay={120} />
        <StatCard label="Water" value={`${water} / 8`} sub="glasses today" color="var(--teal)" icon={Droplets} delay={180} />
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.45fr', gap:18, marginBottom:18 }}>

        {/* Calorie ring card */}
        <div className="card anim-fade-up" style={{ padding:26, animationDelay:'200ms' }}>
          <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', marginBottom:22, textTransform:'uppercase', letterSpacing:'0.07em' }}>Today's Calories</div>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <CalorieRing consumed={totals.calories} goal={profile?.calories || 2000} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:13 }}>
              <MacroBar label="Protein" current={totals.protein} target={profile?.protein || 150} color="var(--blue)" delay={500} />
              <MacroBar label="Carbs"   current={totals.carbs}   target={profile?.carbs || 200}   color="var(--purple)" delay={600} />
              <MacroBar label="Fats"    current={totals.fat}     target={profile?.fat || 65}       color="var(--orange)" delay={700} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

          {/* Water tracker */}
          <div className="card anim-fade-up" style={{ padding:24, animationDelay:'260ms' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Water Intake</div>
              <span style={{ fontSize:'0.8rem', color:'var(--teal)', fontWeight:700 }}>{water}/8</span>
            </div>
            <div style={{ display:'flex', gap:7, marginBottom:14 }}>
              {Array.from({ length:8 }).map((_, i) => (
                <button key={i} onClick={() => setWater(i < water ? i : i + 1)} style={{
                  flex:1, height:38, borderRadius:9,
                  background: i < water ? 'var(--teal-dim)' : 'var(--bg-3)',
                  border: `1px solid ${i < water ? 'var(--teal)' : 'var(--border)'}`,
                  fontSize:'1rem', cursor:'pointer',
                  transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: i < water ? 'scale(1.05)' : 'scale(1)',
                  filter: i < water ? 'drop-shadow(0 0 4px rgba(45,212,191,0.4))' : 'none',
                }}>
                  {i < water ? '💧' : '·'}
                </button>
              ))}
            </div>
            <p style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>Tap a drop to track glasses. Stay hydrated!</p>
          </div>

          {/* AI Coach nudge */}
          <div className="card anim-fade-up" style={{
            padding:20, animationDelay:'320ms',
            background:'linear-gradient(135deg, rgba(90,143,255,0.08) 0%, rgba(90,143,255,0.04) 100%)',
            border:'1px solid rgba(90,143,255,0.18)',
            cursor:'pointer',
            transition:'all 0.2s ease',
          }}
          onClick={() => navigate('/ai-coach')}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(90,143,255,0.35)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(90,143,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(90,143,255,0.18)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, background:'var(--blue-dim)', border:'1px solid rgba(90,143,255,0.25)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Brain size={20} color="var(--blue)" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--blue)', marginBottom:3 }}>AI Nutrition Coach</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>
                  {remaining > 0 ? `You have ${remaining} kcal left — want meal ideas?` : "You've hit your goal today! 🎉"}
                </div>
              </div>
              <ArrowRight size={15} color="var(--text-3)" />
            </div>
          </div>

          {/* Quick actions */}
          <div className="card anim-fade-up" style={{ padding:'16px 20px', animationDelay:'380ms' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Quick actions</div>
            <div style={{ display:'flex', gap:9 }}>
              {[
                { label:'Log Food', color:'var(--accent)', dim:'var(--accent-dim)', to:'/food' },
                { label:'Progress', color:'var(--purple)', dim:'var(--purple-dim)', to:'/progress' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)} style={{
                  flex:1, padding:'10px', borderRadius:'var(--radius-sm)',
                  background:a.dim, border:`1px solid ${a.color}33`,
                  color:a.color, fontSize:'0.8rem', fontWeight:600,
                  transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px ${a.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                >{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOD LOG ── */}
      <div className="card anim-fade-up" style={{ padding:26, animationDelay:'440ms' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Today's Food Log</div>
          <button onClick={() => navigate('/food')} style={{ background:'none', color:'var(--accent)', fontSize:'0.8rem', fontWeight:600, display:'flex', alignItems:'center', gap:5, transition:'gap 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.gap='8px'}
            onMouseLeave={e => e.currentTarget.style.gap='5px'}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        {logs.length === 0 ? (
          <div className="anim-fade-in" style={{ textAlign:'center', padding:'36px 0', color:'var(--text-3)' }}>
            <div style={{ fontSize:'2.2rem', marginBottom:12 }}>🍽️</div>
            <p style={{ fontSize:'0.875rem', marginBottom:16 }}>Nothing logged yet today.</p>
            <button className="btn-primary" style={{ fontSize:'0.82rem', padding:'9px 20px' }} onClick={() => navigate('/food')}>
              <Plus size={13} /> Log your first meal
            </button>
          </div>
        ) : (
          <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {logs.slice(-6).map(log => (
              <div key={log.id} className="anim-fade-up" style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'11px 14px', background:'var(--bg-3)', borderRadius:'var(--radius-sm)',
                transition:'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--bg-3)'}
              >
                <div>
                  <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{log.food_name}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:2 }}>{log.meal_type} · {log.serving_size}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--accent)' }}>{log.calories} kcal</div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-3)', marginTop:1 }}>P:{log.protein}g C:{log.carbs}g F:{log.fat}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
