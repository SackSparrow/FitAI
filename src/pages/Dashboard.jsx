import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFoodLog, useStreak } from '../hooks/useFoodLog'
import { useNavigate } from 'react-router-dom'
import { Flame, Droplets, Zap, TrendingUp, Plus, ChevronRight, Brain } from 'lucide-react'

function MacroBar({ label, current, target, color }) {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:6 }}>
        <span style={{ color:'var(--text-2)' }}>{label}</span>
        <span style={{ color, fontWeight:600 }}>{Math.round(current)}<span style={{ color:'var(--text-3)', fontWeight:400 }}>/{target}g</span></span>
      </div>
      <div style={{ height:6, background:'var(--bg-3)', borderRadius:6 }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:6, background:color, transition:'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon: Icon, accent }) {
  return (
    <div className="card" style={{ padding:20, borderColor: accent ? 'rgba(200,245,90,0.2)' : 'var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>{label}</span>
        <div style={{ width:30, height:30, background:color+'22', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize:'1.8rem', fontFamily:'var(--font-display)', fontWeight:800, color: accent ? 'var(--accent)' : 'var(--text)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

function CalorieRing({ consumed, goal }) {
  const pct = Math.min(consumed / goal, 1)
  const r = 52, cx = 64, cy = 64
  const circumference = 2 * Math.PI * r
  const dash = circumference * pct
  const over = consumed > goal
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={128} height={128} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={over ? 'var(--red)' : 'var(--accent)'}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition:'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div style={{ marginTop:-8 }}>
        <div style={{ fontSize:'1.6rem', fontFamily:'var(--font-display)', fontWeight:800, color: over ? 'var(--red)' : 'var(--accent)' }}>{Math.round(consumed)}</div>
        <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>of {goal} kcal</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { totals, logs } = useFoodLog(user?.id)
  const streak = useStreak(user?.id)
  const navigate = useNavigate()
  const [water, setWater] = useState(0)

  const remaining = (profile?.calories || 2000) - totals.calories
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding:'32px 40px', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800 }}>{greeting}, {profile?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>Here's your nutrition overview for today.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/food')} style={{ gap:8 }}>
          <Plus size={16} /> Log Food
        </button>
      </div>

      {/* Top stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Streak" value={`${streak} 🔥`} sub="days in a row" color="var(--orange)" icon={Flame} />
        <StatCard label="Remaining" value={remaining > 0 ? remaining : 0} sub="kcal left today" color="var(--accent)" icon={Zap} accent />
        <StatCard label="Consumed" value={Math.round(totals.calories)} sub={`of ${profile?.calories || 2000} goal`} color="var(--blue)" icon={TrendingUp} />
        <StatCard label="Water" value={`${water}/8`} sub="glasses today"
          color="var(--teal)" icon={Droplets} />
      </div>

      {/* Main content grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:20, marginBottom:20 }}>
        {/* Calorie ring + macros */}
        <div className="card" style={{ padding:28 }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:20 }}>Today's Calories</h3>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <CalorieRing consumed={totals.calories} goal={profile?.calories || 2000} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>
              <MacroBar label="Protein" current={totals.protein} target={profile?.protein || 150} color="var(--blue)" />
              <MacroBar label="Carbs" current={totals.carbs} target={profile?.carbs || 200} color="var(--purple)" />
              <MacroBar label="Fats" current={totals.fat} target={profile?.fat || 65} color="var(--orange)" />
            </div>
          </div>
        </div>

        {/* Water tracker */}
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:'0.9rem', fontWeight:700 }}>Water Intake</h3>
            <span style={{ fontSize:'0.8rem', color:'var(--teal)', fontWeight:600 }}>{water}/8 glasses</span>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            {Array.from({length:8}).map((_, i) => (
              <button key={i} onClick={() => setWater(i < water ? i : i + 1)} style={{
                width:44, height:44, borderRadius:12,
                background: i < water ? 'var(--teal-dim)' : 'var(--bg-3)',
                border: `1px solid ${i < water ? 'var(--teal)' : 'var(--border)'}`,
                fontSize:'1.2rem', transition:'all 0.15s',
                cursor:'pointer',
              }}>
                {i < water ? '💧' : '○'}
              </button>
            ))}
          </div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>
            Tap to add glasses. Stay hydrated! 💙
          </div>

          {/* Quick AI nudge */}
          <div style={{
            marginTop:20, padding:'14px 16px',
            background:'var(--blue-dim)', border:'1px solid rgba(90,143,255,0.2)',
            borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', gap:12,
            cursor:'pointer',
          }}
          onClick={() => navigate('/ai-coach')}
          >
            <Brain size={18} color="var(--blue)" />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--blue)' }}>AI Nutrition Coach</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:2 }}>
                {remaining > 0 ? `You have ${remaining} kcal left — ask for meal ideas!` : "You've hit your goal today! 🎉"}
              </div>
            </div>
            <ChevronRight size={14} color="var(--text-3)" />
          </div>
        </div>
      </div>

      {/* Recent food log */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:700 }}>Today's Food Log</h3>
          <button onClick={() => navigate('/food')} style={{ background:'none', color:'var(--accent)', fontSize:'0.8rem', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        {logs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)' }}>
            <div style={{ fontSize:'2rem', marginBottom:10 }}>🍽️</div>
            <p style={{ fontSize:'0.875rem' }}>Nothing logged yet today.</p>
            <button className="btn-primary" style={{ marginTop:16, fontSize:'0.85rem', padding:'10px 20px' }} onClick={() => navigate('/food')}>
              <Plus size={14} /> Log your first meal
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {logs.slice(-5).map(log => (
              <div key={log.id} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'10px 14px', background:'var(--bg-3)', borderRadius:'var(--radius-sm)',
              }}>
                <div>
                  <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{log.food_name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{log.meal_type} · {log.serving_size}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--accent)' }}>{log.calories} kcal</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>P:{log.protein}g C:{log.carbs}g F:{log.fat}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
