import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp, Minus, Plus, Scale, Target } from 'lucide-react'
import { format, subDays } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:'0.8rem', boxShadow:'var(--shadow)' }}>
      <div style={{ color:'var(--text-3)', marginBottom:4 }}>{label}</div>
      <div style={{ color:'var(--accent)', fontWeight:700 }}>{payload[0].value} {payload[0].name === 'weight' ? 'kg' : 'kcal'}</div>
    </div>
  )
  return null
}

export default function Progress() {
  const { user, profile } = useAuth()
  const [weightLogs, setWeightLogs] = useState([])
  const [newWeight, setNewWeight]   = useState('')
  const [adding, setAdding]         = useState(false)
  const [loading, setLoading]       = useState(true)
  const [calorieLogs, setCalorieLogs] = useState([])

  useEffect(() => {
    if (!user) return
    fetchWeightLogs()
    fetchCalorieLogs()
  }, [user])

  async function fetchWeightLogs() {
    const { data } = await supabase.from('weight_logs').select('*').eq('user_id', user.id).order('date', { ascending:true }).limit(30)
    setWeightLogs(data || [])
    setLoading(false)
  }

  async function fetchCalorieLogs() {
    const dates = Array.from({length:14}, (_, i) => format(subDays(new Date(), 13-i), 'yyyy-MM-dd'))
    const { data } = await supabase.from('food_logs').select('date, calories').eq('user_id', user.id).in('date', dates)
    const byDate = {}
    dates.forEach(d => { byDate[d] = 0 })
    data?.forEach(row => { byDate[row.date] = (byDate[row.date] || 0) + row.calories })
    setCalorieLogs(dates.map(d => ({ date: format(new Date(d+'T00:00:00'), 'MMM d'), calories: Math.round(byDate[d]) })))
  }

  async function logWeight() {
    if (!newWeight) return
    setAdding(true)
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase.from('weight_logs').upsert({ user_id:user.id, date:today, weight_kg:parseFloat(newWeight) }, { onConflict:'user_id,date' }).select().single()
    if (!error) {
      setWeightLogs(prev => [...prev.filter(w => w.date !== today), data].sort((a,b) => a.date.localeCompare(b.date)))
      setNewWeight('')
    }
    setAdding(false)
  }

  const chartData  = weightLogs.map(w => ({ date: format(new Date(w.date+'T00:00:00'), 'MMM d'), weight: w.weight_kg }))
  const latest     = weightLogs[weightLogs.length - 1]?.weight_kg
  const prev       = weightLogs[weightLogs.length - 2]?.weight_kg
  const startW     = weightLogs[0]?.weight_kg || profile?.weight_kg
  const diff       = latest && prev ? (latest - prev).toFixed(1) : null
  const totalDiff  = latest && startW ? (latest - startW).toFixed(1) : null
  const target     = profile?.target_weight_kg
  const toTarget   = latest && target ? Math.abs((latest - target).toFixed(1)) : null

  const stats = [
    { label:'Current Weight', value: latest ? `${latest} kg` : '—', color:'var(--accent)', icon:Scale },
    { label:'Last Change',    value: diff ? `${diff > 0 ? '+' : ''}${diff} kg` : '—', color: diff > 0 ? 'var(--orange)' : 'var(--teal)', icon: diff > 0 ? TrendingUp : TrendingDown },
    { label:'Total Change',   value: totalDiff ? `${totalDiff > 0 ? '+' : ''}${totalDiff} kg` : '—', color:'var(--blue)', icon: totalDiff < 0 ? TrendingDown : TrendingUp },
    { label:'To Target',      value: toTarget != null ? `${toTarget} kg` : '—', color:'var(--purple)', icon:Target },
  ]

  return (
    <div style={{ padding:'32px 40px', maxWidth:1000, margin:'0 auto' }}>
      <div className="anim-fade-up" style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Progress</h1>
        <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>Track your weight journey and calorie history.</p>
      </div>

      {/* Stats row */}
      <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="card card-hover anim-fade-up" style={{ padding:20, animationDelay:`${i * 60}ms` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <span style={{ fontSize:'0.7rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>{s.label}</span>
              <div style={{ width:28, height:28, background:`${s.color}18`, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <s.icon size={13} color={s.color} />
              </div>
            </div>
            <div className="anim-count" style={{ fontSize:'1.5rem', fontFamily:'var(--font-display)', fontWeight:800, color:s.color, animationDelay:`${i*60+100}ms` }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Weight chart */}
      <div className="card anim-fade-up" style={{ padding:26, marginBottom:18, animationDelay:'240ms' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.95rem' }}>Weight History</div>
            {target && <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:3 }}>Target: {target} kg</div>}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <input
              type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
              placeholder="Today's weight (kg)"
              className="input-field"
              style={{ width:200, padding:'8px 12px', fontSize:'0.85rem' }}
              onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
              onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
              onKeyDown={e => e.key === 'Enter' && logWeight()}
            />
            <button className="btn-primary" onClick={logWeight} disabled={adding || !newWeight} style={{ padding:'8px 16px', fontSize:'0.82rem' }}>
              {adding ? <div className="spinner" /> : <><Plus size={13} /> Log</>}
            </button>
          </div>
        </div>

        {chartData.length < 2 ? (
          <div className="anim-fade-in" style={{ textAlign:'center', padding:'52px 0', color:'var(--text-3)' }}>
            <Scale size={34} style={{ marginBottom:14, opacity:0.25 }} />
            <p style={{ fontSize:'0.875rem' }}>No weight data yet. Log your weight above to start your chart.</p>
          </div>
        ) : (
          <div className="anim-fade-in" style={{ animationDelay:'300ms' }}>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top:5, right:10, bottom:0, left:0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-3)" tick={{ fontSize:11 }} />
                <YAxis stroke="var(--text-3)" tick={{ fontSize:11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2.5} fill="url(#wGrad)"
                  dot={{ fill:'var(--accent)', r:4, strokeWidth:0 }}
                  activeDot={{ r:6, fill:'var(--accent)', strokeWidth:0, filter:'drop-shadow(0 0 6px rgba(200,245,90,0.8))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Calorie history */}
      <div className="card anim-fade-up" style={{ padding:26, animationDelay:'320ms' }}>
        <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:22 }}>Calorie History <span style={{ fontWeight:400, color:'var(--text-3)', fontSize:'0.82rem' }}>(Last 14 days)</span></div>
        {calorieLogs.every(d => d.calories === 0) ? (
          <div className="anim-fade-in" style={{ textAlign:'center', padding:'52px 0', color:'var(--text-3)', fontSize:'0.875rem' }}>
            Start logging food to see your calorie history here.
          </div>
        ) : (
          <div className="anim-fade-in" style={{ animationDelay:'400ms' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={calorieLogs} margin={{ top:5, right:10, bottom:0, left:0 }}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-3)" tick={{ fontSize:11 }} />
                <YAxis stroke="var(--text-3)" tick={{ fontSize:11 }} />
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, fontSize:'0.8rem' }} />
                <Area type="monotone" dataKey="calories" stroke="var(--purple)" strokeWidth={2.5} fill="url(#cGrad)"
                  dot={{ fill:'var(--purple)', r:3, strokeWidth:0 }}
                  activeDot={{ r:5, filter:'drop-shadow(0 0 5px rgba(168,85,247,0.7))' }}
                  name="Calories"
                />
                {profile?.calories && (
                  <Area type="monotone" dataKey={() => profile.calories} stroke="var(--accent)" strokeDasharray="5 3" fill="none" strokeWidth={1.5} dot={false} name="Goal" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
