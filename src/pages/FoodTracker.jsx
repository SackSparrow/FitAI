import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { Search, Plus, X, Check, ChevronDown, Loader } from 'lucide-react'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

// Large built-in food database
const FOOD_DB = [
  // Proteins
  { name:'Chicken Breast (100g)', calories:165, protein:31, carbs:0, fat:3.6, serving:'100g' },
  { name:'Eggs (1 large)', calories:72, protein:6, carbs:0.4, fat:5, serving:'1 egg' },
  { name:'Greek Yogurt (100g)', calories:59, protein:10, carbs:3.6, fat:0.4, serving:'100g' },
  { name:'Tuna (100g)', calories:132, protein:28, carbs:0, fat:1.3, serving:'100g' },
  { name:'Salmon (100g)', calories:208, protein:20, carbs:0, fat:13, serving:'100g' },
  { name:'Ground Beef 80/20 (100g)', calories:254, protein:17, carbs:0, fat:20, serving:'100g' },
  { name:'Cottage Cheese (100g)', calories:98, protein:11, carbs:3.4, fat:4.3, serving:'100g' },
  { name:'Whey Protein Shake', calories:120, protein:24, carbs:3, fat:1.5, serving:'1 scoop' },
  { name:'Tofu (100g)', calories:76, protein:8, carbs:1.9, fat:4.2, serving:'100g' },
  { name:'Turkey Breast (100g)', calories:135, protein:30, carbs:0, fat:1, serving:'100g' },
  // Carbs
  { name:'White Rice (cooked 100g)', calories:130, protein:2.7, carbs:28, fat:0.3, serving:'100g' },
  { name:'Brown Rice (cooked 100g)', calories:122, protein:2.6, carbs:25, fat:1, serving:'100g' },
  { name:'Oats (100g dry)', calories:389, protein:17, carbs:66, fat:7, serving:'100g' },
  { name:'Whole Wheat Bread (1 slice)', calories:69, protein:4, carbs:12, fat:1, serving:'1 slice' },
  { name:'White Bread (1 slice)', calories:79, protein:3, carbs:15, fat:1, serving:'1 slice' },
  { name:'Pasta (cooked 100g)', calories:158, protein:5.8, carbs:31, fat:0.9, serving:'100g' },
  { name:'Sweet Potato (100g)', calories:86, protein:1.6, carbs:20, fat:0.1, serving:'100g' },
  { name:'Banana (medium)', calories:105, protein:1.3, carbs:27, fat:0.4, serving:'1 banana' },
  { name:'Apple (medium)', calories:95, protein:0.5, carbs:25, fat:0.3, serving:'1 apple' },
  { name:'Quinoa (cooked 100g)', calories:120, protein:4.4, carbs:22, fat:1.9, serving:'100g' },
  // Fats
  { name:'Avocado (half)', calories:120, protein:1.5, carbs:6, fat:11, serving:'half' },
  { name:'Peanut Butter (2 tbsp)', calories:190, protein:7, carbs:6, fat:16, serving:'2 tbsp' },
  { name:'Almonds (28g)', calories:164, protein:6, carbs:6, fat:14, serving:'28g' },
  { name:'Olive Oil (1 tbsp)', calories:119, protein:0, carbs:0, fat:14, serving:'1 tbsp' },
  { name:'Cheddar Cheese (28g)', calories:113, protein:7, carbs:0.4, fat:9, serving:'28g' },
  // Meals
  { name:'Oatmeal with Banana', calories:310, protein:10, carbs:58, fat:5, serving:'1 bowl' },
  { name:'Chicken & Rice Bowl', calories:450, protein:42, carbs:48, fat:7, serving:'1 bowl' },
  { name:'Protein Smoothie', calories:280, protein:30, carbs:28, fat:6, serving:'1 glass' },
  { name:'Caesar Salad (no croutons)', calories:290, protein:8, carbs:12, fat:24, serving:'1 serving' },
  { name:'Grilled Salmon with Veggies', calories:380, protein:38, carbs:12, fat:18, serving:'1 plate' },
  // Dairy
  { name:'Whole Milk (250ml)', calories:149, protein:8, carbs:12, fat:8, serving:'250ml' },
  { name:'Skim Milk (250ml)', calories:83, protein:8, carbs:12, fat:0.2, serving:'250ml' },
  // Beverages
  { name:'Orange Juice (250ml)', calories:112, protein:1.7, carbs:26, fat:0.5, serving:'250ml' },
  { name:'Black Coffee', calories:2, protein:0.3, carbs:0, fat:0, serving:'1 cup' },
]

function FoodItem({ food, onAdd }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'12px 14px', borderRadius:'var(--radius-sm)',
      background:'var(--bg-3)', border:'1px solid var(--border)',
      transition:'border-color 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hover)'}
    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
    >
      <div>
        <div style={{ fontSize:'0.875rem', fontWeight:500, marginBottom:2 }}>{food.name}</div>
        <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
          <span style={{ color:'var(--accent)' }}>{food.calories} kcal</span>
          {' · '}P:{food.protein}g C:{food.carbs}g F:{food.fat}g
          {' · '}{food.serving}
        </div>
      </div>
      <button onClick={() => onAdd(food)} style={{
        width:32, height:32, borderRadius:8,
        background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'var(--accent)', cursor:'pointer', transition:'all 0.15s',
        flexShrink:0,
      }}
      onMouseEnter={e => e.currentTarget.style.background='var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.background='var(--accent-dim)'}
      >
        <Plus size={16} color="currentColor" />
      </button>
    </div>
  )
}

export default function FoodTracker() {
  const { user, profile } = useAuth()
  const { logs, addFood, removeFood, totals } = useFoodLog(user?.id)
  const [query, setQuery] = useState('')
  const [activeMeal, setActiveMeal] = useState('Breakfast')
  const [addedId, setAddedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [customForm, setCustomForm] = useState(false)
  const [custom, setCustom] = useState({ name:'', calories:'', protein:'', carbs:'', fat:'', serving:'1 serving' })

  const results = query.trim()
    ? FOOD_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : FOOD_DB.slice(0, 8)

  async function handleAdd(food) {
    setAdding(true)
    const { data } = await addFood({
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      serving_size: food.serving,
      meal_type: activeMeal,
    })
    setAddedId(data?.id)
    setTimeout(() => setAddedId(null), 1500)
    setAdding(false)
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

  return (
    <div style={{ padding:'32px 40px', maxWidth:1100, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Food Tracker</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>Log your meals and track your macros.</p>
        </div>
        {/* Daily totals */}
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
          {/* Meal type selector */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
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
          <div style={{ position:'relative', marginBottom:14 }}>
            <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search foods..."
              style={{
                width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-sm)', padding:'10px 14px 10px 38px',
                color:'var(--text)', fontSize:'0.875rem',
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          {/* Results */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:420, overflowY:'auto', paddingRight:4 }}>
            {results.map(food => (
              <FoodItem key={food.name} food={food} onAdd={handleAdd} />
            ))}
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
                  <input type={f.type} value={custom[f.key]} onChange={e => setCustom(c => ({...c, [f.key]: e.target.value}))}
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
            return (
              <div key={meal} className="card" style={{ padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: mLogs.length ? 12 : 0 }}>
                  <h4 style={{ fontSize:'0.875rem', fontWeight:700 }}>{meal}</h4>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>{mCals > 0 ? `${mCals} kcal` : '—'}</span>
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
                          <div style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>{log.serving_size}</div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:'0.82rem', color:'var(--accent)', fontWeight:600 }}>{log.calories}</span>
                          <button onClick={() => removeFood(log.id)} style={{
                            width:22, height:22, borderRadius:6, background:'transparent',
                            border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center',
                            color:'var(--text-3)', cursor:'pointer',
                          }}>
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
