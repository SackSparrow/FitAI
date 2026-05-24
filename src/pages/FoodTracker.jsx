import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { Search, Plus, X, Check } from 'lucide-react'
import { FOOD_DB, CATEGORIES } from '../data/foodDatabase'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

function FoodItem({ food, onAdd }) {
  return (
    <div
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 14px', borderRadius:'var(--radius-sm)',
        background:'var(--bg-3)', border:'1px solid var(--border)',
        transition:'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'0.875rem', fontWeight:500, marginBottom:2 }}>{food.name}</div>
        <div style={{ fontSize:'0.75rem', color:'var(--text-3)', display:'flex', gap:8, flexWrap:'wrap' }}>
          <span style={{ color:'var(--accent)', fontWeight:600 }}>{food.calories} kcal</span>
          <span>P: {food.protein}g</span>
          <span>C: {food.carbs}g</span>
          <span>F: {food.fat}g</span>
          <span style={{ color:'var(--text-3)' }}>· {food.serving}</span>
        </div>
      </div>
      <button
        onClick={() => onAdd(food)}
        style={{
          width:32, height:32, borderRadius:8, marginLeft:10,
          background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--accent)', cursor:'pointer', transition:'all 0.15s', flexShrink:0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='#0a0a0f' }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--accent-dim)'; e.currentTarget.style.color='var(--accent)' }}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

export default function FoodTracker() {
  const { user, profile } = useAuth()
  const { logs, addFood, removeFood, totals } = useFoodLog(user?.id)
  const [query, setQuery] = useState('')
  const [activeMeal, setActiveMeal] = useState('Breakfast')
  const [activeCategory, setActiveCategory] = useState('All')
  const [customForm, setCustomForm] = useState(false)
  const [custom, setCustom] = useState({ name:'', calories:'', protein:'', carbs:'', fat:'', serving:'1 serving' })

  const filtered = FOOD_DB.filter(f => {
    const matchQuery = !query.trim() || f.name.toLowerCase().includes(query.toLowerCase())
    const matchCat = activeCategory === 'All' || f.category === activeCategory
    return matchQuery && matchCat
  }).slice(0, 15)

  async function handleAdd(food) {
    await addFood({
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      serving_size: food.serving,
      meal_type: activeMeal,
    })
  }

  async function handleCustomAdd() {
    if (!custom.name || !custom.calories) return
    await handleAdd({
      name: custom.name,
      calories: parseInt(custom.calories),
      protein: parseInt(custom.protein) || 0,
      carbs: parseInt(custom.carbs) || 0,
      fat: parseInt(custom.fat) || 0,
      serving: custom.serving,
    })
    setCustom({ name:'', calories:'', protein:'', carbs:'', fat:'', serving:'1 serving' })
    setCustomForm(false)
  }

  const mealLogs = (meal) => logs.filter(l => l.meal_type === meal)
  const allCategories = ['All', ...CATEGORIES]

  return (
    <div style={{ padding:'32px 40px', maxWidth:1100, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Food Tracker</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>
            {FOOD_DB.length}+ foods including Indian brands, supplements & restaurants
          </p>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {[
            { label:'Calories', val: Math.round(totals.calories), of: profile?.calories || 2000, color:'var(--accent)' },
            { label:'Protein', val: Math.round(totals.protein)+'g', of: (profile?.protein||150)+'g', color:'var(--blue)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'10px 16px' }}>
              <div style={{ fontSize:'1.1rem', fontWeight:800, color:s.color, fontFamily:'var(--font-display)' }}>{s.val}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>{s.label} · of {s.of}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:24 }}>

        {/* Left: search & add */}
        <div>
          {/* Meal selector */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            {MEAL_TYPES.map(m => (
              <button key={m} onClick={() => setActiveMeal(m)} style={{
                padding:'8px 14px', borderRadius:100,
                background: activeMeal === m ? 'var(--accent)' : 'var(--bg-3)',
                color: activeMeal === m ? '#0a0a0f' : 'var(--text-2)',
                border: `1px solid ${activeMeal === m ? 'transparent' : 'var(--border)'}`,
                fontSize:'0.8rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              }}>{m}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position:'relative', marginBottom:12 }}>
            <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${FOOD_DB.length}+ foods... (e.g. MaxProtein, paneer, oats)`}
              style={{
                width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-sm)', padding:'10px 14px 10px 38px',
                color:'var(--text)', fontSize:'0.875rem',
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          {/* Category filter */}
          <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:4 }}>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding:'5px 12px', borderRadius:100, whiteSpace:'nowrap',
                background: activeCategory === cat ? 'var(--blue)' : 'var(--bg-3)',
                color: activeCategory === cat ? '#fff' : 'var(--text-3)',
                border: `1px solid ${activeCategory === cat ? 'transparent' : 'var(--border)'}`,
                fontSize:'0.72rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s', flexShrink:0,
              }}>{cat}</button>
            ))}
          </div>

          {/* Results */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:400, overflowY:'auto', paddingRight:4 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px', color:'var(--text-3)', fontSize:'0.875rem' }}>
                No foods found for "{query}".<br />
                <span style={{ fontSize:'0.78rem' }}>Try adding it as a custom food below.</span>
              </div>
            ) : (
              filtered.map(food => (
                <FoodItem key={food.name + food.category} food={food} onAdd={handleAdd} />
              ))
            )}
          </div>

          {/* Custom food */}
          <button onClick={() => setCustomForm(!customForm)} style={{
            width:'100%', marginTop:14, padding:'10px',
            background:'transparent', border:'1px dashed var(--border)', borderRadius:'var(--radius-sm)',
            color:'var(--text-3)', fontSize:'0.85rem', cursor:'pointer', transition:'all 0.15s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            <Plus size={14} /> Add custom food
          </button>

          {customForm && (
            <div className="card" style={{ marginTop:12, padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              <h4 style={{ fontSize:'0.875rem', fontWeight:700 }}>Custom Food</h4>
              {[
                { key:'name', label:'Food name', type:'text' },
                { key:'calories', label:'Calories', type:'number' },
                { key:'protein', label:'Protein (g)', type:'number' },
                { key:'carbs', label:'Carbs (g)', type:'number' },
                { key:'fat', label:'Fat (g)', type:'number' },
                { key:'serving', label:'Serving size', type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.72rem', color:'var(--text-3)', display:'block', marginBottom:4 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={custom[f.key]}
                    onChange={e => setCustom(c => ({...c, [f.key]: e.target.value}))}
                    style={{ width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:'0.85rem' }}
                  />
                </div>
              ))}
              <button className="btn-primary" onClick={handleCustomAdd} style={{ justifyContent:'center', marginTop:4 }}>
                <Check size={14} /> Add to {activeMeal}
              </button>
            </div>
          )}
        </div>

        {/* Right: today's log by meal */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {MEAL_TYPES.map(meal => {
            const mLogs = mealLogs(meal)
            const mCals = mLogs.reduce((s, l) => s + l.calories, 0)
            const mProtein = mLogs.reduce((s, l) => s + (l.protein || 0), 0)
            return (
              <div key={meal} className="card" style={{ padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: mLogs.length ? 12 : 0 }}>
                  <h4 style={{ fontSize:'0.875rem', fontWeight:700 }}>{meal}</h4>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {mProtein > 0 && <span style={{ fontSize:'0.72rem', color:'var(--blue)', fontWeight:600 }}>{Math.round(mProtein)}g P</span>}
                    <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>{mCals > 0 ? `${Math.round(mCals)} kcal` : '—'}</span>
                  </div>
                </div>
                {mLogs.length === 0 ? (
                  <div style={{ fontSize:'0.78rem', color:'var(--text-3)', padding:'4px 0' }}>No items yet.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {mLogs.map(log => (
                      <div key={log.id} style={{
                        display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'8px 10px', background:'var(--bg-3)', borderRadius:8,
                      }}>
                        <div>
                          <div style={{ fontSize:'0.82rem', fontWeight:500 }}>{log.food_name}</div>
                          <div style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>
                            {log.serving_size} · P:{Math.round(log.protein||0)}g C:{Math.round(log.carbs||0)}g F:{Math.round(log.fat||0)}g
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:'0.82rem', color:'var(--accent)', fontWeight:600 }}>{Math.round(log.calories)}</span>
                          <button
                            onClick={() => removeFood(log.id)}
                            style={{
                              width:22, height:22, borderRadius:6, background:'transparent',
                              border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center',
                              color:'var(--text-3)', cursor:'pointer', transition:'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--red,#ff4444)'; e.currentTarget.style.color='var(--red,#ff4444)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-3)' }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
