import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingDown, TrendingUp, Minus, Plus, Scale } from 'lucide-react'
import { format, subDays } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:'0.8rem' }}>
        <div style={{ color:'var(--text-3)', marginBottom:4 }}>{label}</div>
        <div style={{ color:'var(--accent)', fontWeight:700 }}>{payload[0].value} kg</div>
      </div>
    )
  }
  return null
}

export default function Progress() {
  const { user, profile } = useAuth()
  const [weightLogs, setWeightLogs] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calorieLogs, setCalorieLogs] = useState([])

  useEffect(() => {
    if (!user) return
    fetchWeightLogs()
    fetchCalorieLogs()
  }, [user])

  async function fetchWeightLogs() {
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(30)
    setWeightLogs(data || [])
    setLoading(false)
  }

  async function fetchCalorieLogs() {
    // Get last 14 days calorie totals
    const dates = Array.from({length:14}, (_, i) => format(subDays(new Date(), 13-i), 'yyyy-MM-dd'))
    const { data } = await supabase
      .from('food_logs')
      .select('date, calories')
      .eq('user_id', user.id)
      .in('date', dates)
    
    // Aggregate by date
    const byDate = {}
    dates.forEach(d => { byDate[d] = 0 })
    data?.forEach(row => { byDate[row.date] = (byDate[row.date] || 0) + row.calories })
    
    setCalorieLogs(dates.map(d => ({
      date: format(new Date(d+'T00:00:00'), 'MMM d'),
      calories: Math.round(byDate[d]),
    })))
  }

  async function logWeight() {
    if (!newWeight) return
    setAdding(true)
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase.from('weight_logs').upsert({
      user_id: user.id,
      date: today,
      weight_kg: parseFloat(newWeight),
    }, { onConflict: 'user_id,date' }).select().single()
    if (!error) {
      setWeightLogs(prev => {
        const filtered = prev.filter(w => w.date !== today)
        return [...filtered, data].sort((a,b) => a.date.localeCompare(b.date))
      })
      setNewWeight('')
    }
    setAdding(false)
  }

  const chartData = weightLogs.map(w => ({
    date: format(new Date(w.date+'T00:00:00'), 'MMM d'),
    weight: w.weight_kg,
  }))

  const latest = weightLogs[weightLogs.length - 1]?.weight_kg
  const prev = weightLogs[weightLogs.length - 2]?.weight_kg
  const startWeight = weightLogs[0]?.weight_kg || profile?.weight_kg
  const diff = latest && prev ? (latest - prev).toFixed(1) : null
  const totalDiff = latest && startWeight ? (latest - startWeight).toFixed(1) : null
  const target = profile?.target_weight_kg

  return (
    <div style={{ padding:'32px 40px', maxWidth:1000, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Progress</h1>
        <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>Track your weight and calorie history over time.</p>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Current Weight', value: latest ? `${latest} kg` : '—', color:'var(--accent)', icon: Scale },
          { label:'Change (week)', value: diff ? `${diff > 0 ? '+' : ''}${diff} kg` : '—', color: diff > 0 ? 'var(--orange)' : 'var(--teal)', icon: diff > 0 ? TrendingUp : TrendingDown },
          { label:'Total Change', value: totalDiff ? `${totalDiff > 0 ? '+' : ''}${totalDiff} kg` : '—', color: totalDiff < 0 && profile?.goal==='lose_weight' ? 'var(--teal)' : 'var(--text-2)', icon: totalDiff < 0 ? TrendingDown : TrendingUp },
          { label:'Target Weight', value: target ? `${target} kg` : '—', color:'var(--blue)', icon: Minus },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:20 }}>
            <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:'1.5rem', fontFamily:'var(--font-display)', fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Weight chart */}
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700 }}>Weight History</h3>
          {/* Log weight input */}
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <input
              type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
              placeholder="Today's weight (kg)"
              style={{
                background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
                padding:'8px 12px', color:'var(--text)', fontSize:'0.85rem', width:180,
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
              onKeyDown={e => e.key === 'Enter' && logWeight()}
            />
            <button className="btn-primary" onClick={logWeight} disabled={adding || !newWeight} style={{ padding:'8px 16px', fontSize:'0.85rem' }}>
              {adding ? <div className="spinner" /> : <><Plus size={14} /> Log</>}
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-3)' }}>
            <Scale size={32} style={{ marginBottom:12, opacity:0.3 }} />
            <p style={{ fontSize:'0.875rem' }}>No weight data yet. Log your weight above to get started.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-3)" tick={{ fontSize:12 }} />
              <YAxis stroke="var(--text-3)" tick={{ fontSize:12 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip content={<CustomTooltip />} />
              {target && <Line type="monotone" dataKey={() => target} stroke="var(--blue)" strokeDasharray="4 4" dot={false} name="Target" />}
              <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill:'var(--accent)', r:4 }} activeDot={{ r:6 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Calorie history */}
      <div className="card" style={{ padding:24 }}>
        <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:20 }}>Calorie History (Last 14 Days)</h3>
        {calorieLogs.every(d => d.calories === 0) ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-3)', fontSize:'0.875rem' }}>
            No calorie data yet. Start logging food to see your history.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={calorieLogs}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-3)" tick={{ fontSize:11 }} />
              <YAxis stroke="var(--text-3)" tick={{ fontSize:11 }} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, fontSize:'0.8rem' }} />
              <Area type="monotone" dataKey="calories" stroke="var(--purple)" strokeWidth={2} fill="url(#calGrad)" dot={{ fill:'var(--purple)', r:3 }} name="Calories" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
