import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { Search, Plus, X, Check, ChevronDown } from 'lucide-react'
import { FOOD_DB, CATEGORIES } from '../data/foodDatabase'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
const MEAL_ICONS = { Breakfast:'☀️', Lunch:'🌤️', Dinner:'🌙', Snacks:'🍎' }

// Unit definitions — each has a multiplier relative to the food's base serving
// The food DB stores macros per its "serving" size (e.g. 100g, 1 egg, 1 bar)
// We need to know: what is the base serving in grams (or pieces)?
// Strategy: detect from the serving string, fall back to gram-based units

function getUnitsForFood(food) {
  const s = food.serving.toLowerCase()

  // Piece/count based foods
  if (s.includes('egg') || s.includes('piece') || s.includes('bar') ||
      s.includes('slice') || s.includes('roti') || s.includes('paratha') ||
      s.includes('idli') || s.includes('dosa') || s.includes('vada') ||
      s.includes('samosa') || s.includes('burger') || s.includes('sub') ||
      s.includes('scoop') || s.includes('banana') || s.includes('apple') ||
      s.includes('orange') || s.includes('medium') || s.includes('large') ||
      s.includes('small') || s.includes('bowl') || s.includes('plate') ||
      s.includes('glass') || s.includes('cup') || s.includes('can') ||
      s.includes('pack') || s.includes('tbsp') || s.includes('tsp') ||
      s.includes('handful') || s.includes('serving') || s.includes('cob')) {
    // These are "unit" foods — user picks how many units
    return [
      { label: `1 ${food.serving}`, multiplier: 1 },
      { label: `0.5 ${food.serving}`, multiplier: 0.5 },
      { label: `1.5 ${food.serving}`, multiplier: 1.5 },
      { label: `2 ${food.serving}`, multiplier: 2 },
      { label: `3 ${food.serving}`, multiplier: 3 },
    ]
  }

  // Weight-based (100g base)
  if (s.includes('100g') || s.includes('100 g')) {
    return [
      { label: '100g',  multiplier: 1 },
      { label: '50g',   multiplier: 0.5 },
      { label: '150g',  multiplier: 1.5 },
      { label: '200g',  multiplier: 2 },
      { label: '250g',  multiplier: 2.5 },
      { label: '300g',  multiplier: 3 },
      { label: '400g',  multiplier: 4 },
      { label: '500g',  multiplier: 5 },
    ]
  }

  // ml-based (250ml base)
  if (s.includes('ml') || s.includes('l')) {
    return [
      { label: `${food.serving}`,  multiplier: 1 },
      { label: '100ml',  multiplier: 0.4 },
      { label: '150ml',  multiplier: 0.6 },
      { label: '200ml',  multiplier: 0.8 },
      { label: '300ml',  multiplier: 1.2 },
      { label: '400ml',  multiplier: 1.6 },
      { label: '500ml',  multiplier: 2 },
    ]
  }

  // Default fallback — use serving as 1x unit
  return [
    { label: `1 serving (${food.serving})`, multiplier: 1 },
    { label: `0.5 serving`,                 multiplier: 0.5 },
    { label: `1.5 servings`,                multiplier: 1.5 },
    { label: `2 servings`,                  multiplier: 2 },
    { label: `3 servings`,                  multiplier: 3 },
  ]
}

// ── Quantity Picker Modal ──────────────────────────────────────────────────
function QuantityModal({ food, meal, onConfirm, onClose }) {
  const units = getUnitsForFood(food)
  const [selectedUnit, setSelectedUnit] = useState(units[0])
  const [customQty, setCustomQty]       = useState('')
  const [showUnits, setShowUnits]       = useState(false)

  // If customQty is set, use that as a multiplier against per-unit macros
  // customQty is in the same unit as selectedUnit's base
  // e.g. if selectedUnit is "100g", customQty=250 means multiplier = 2.5
  const baseMultiplier = selectedUnit.multiplier

  // Detect if this is a gram-based unit (so custom qty makes sense as grams)
  const isGramBased = selectedUnit.label.endsWith('g') && !selectedUnit.label.includes('serving')
  const isMlBased   = selectedUnit.label.endsWith('ml')

  // Calculate effective multiplier
  let effectiveMultiplier = baseMultiplier
  if (customQty && parseFloat(customQty) > 0) {
    if (isGramBased) {
      // per-100g food: customQty grams → multiplier = customQty / 100
      effectiveMultiplier = parseFloat(customQty) / 100
    } else if (isMlBased) {
      // per-250ml: but we treat each unit as its own base
      const baseGrams = parseFloat(selectedUnit.label)
      effectiveMultiplier = parseFloat(customQty) / (baseGrams || 100)
    }
  }

  const scaled = {
    calories: Math.round(food.calories * effectiveMultiplier),
    protein:  Math.round(food.protein  * effectiveMultiplier * 10) / 10,
    carbs:    Math.round(food.carbs    * effectiveMultiplier * 10) / 10,
    fat:      Math.round(food.fat      * effectiveMultiplier * 10) / 10,
  }

  const servingLabel = customQty
    ? (isGramBased ? `${customQty}g` : isMlBased ? `${customQty}ml` : `${customQty}x ${selectedUnit.label}`)
    : selectedUnit.label

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-up" style={{
        background:'var(--bg-2)',
        border:'1px solid var(--border)',
        borderRadius:'var(--radius-xl) var(--radius-xl) 0 0',
        width:'100%', maxWidth:540,
        padding:'28px 28px 36px',
        boxShadow:'0 -20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:'var(--border-hover)', borderRadius:4, margin:'0 auto 22px' }} />

        {/* Food name + base info */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:4 }}>{food.name}</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>Base serving: {food.serving}</div>
        </div>

        {/* Live macro preview */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:22,
          background:'var(--bg-3)', borderRadius:'var(--radius-sm)', padding:'14px 16px',
        }}>
          {[
            { label:'Calories', val:scaled.calories, unit:'kcal', color:'var(--accent)' },
            { label:'Protein',  val:scaled.protein,  unit:'g',    color:'var(--blue)' },
            { label:'Carbs',    val:scaled.carbs,     unit:'g',    color:'var(--purple)' },
            { label:'Fat',      val:scaled.fat,       unit:'g',    color:'var(--orange)' },
          ].map(m => (
            <div key={m.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.2rem', fontFamily:'var(--font-display)', fontWeight:800, color:m.color, lineHeight:1 }}>{m.val}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--text-3)', marginTop:3 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Serving unit dropdown */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.75rem', color:'var(--text-2)', fontWeight:600, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Serving unit
          </label>
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowUnits(!showUnits)} style={{
              width:'100%', padding:'11px 14px',
              background:'var(--bg-3)', border:'1px solid var(--border)',
              borderRadius:'var(--radius-sm)', color:'var(--text)',
              fontSize:'0.9rem', fontWeight:500,
              display:'flex', justifyContent:'space-between', alignItems:'center',
              transition:'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              {selectedUnit.label}
              <ChevronDown size={15} color="var(--text-3)" style={{ transform: showUnits ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
            </button>
            {showUnits && (
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:10,
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-sm)', overflow:'hidden',
                boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {units.map(u => (
                  <button key={u.label} onClick={() => { setSelectedUnit(u); setCustomQty(''); setShowUnits(false) }} style={{
                    width:'100%', padding:'10px 14px', textAlign:'left',
                    background: selectedUnit.label === u.label ? 'var(--accent-dim)' : 'transparent',
                    color: selectedUnit.label === u.label ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.875rem', borderBottom:'1px solid var(--border)',
                    transition:'background 0.12s', display:'flex', justifyContent:'space-between',
                  }}
                  onMouseEnter={e => { if (selectedUnit.label !== u.label) e.currentTarget.style.background='var(--bg-3)' }}
                  onMouseLeave={e => { if (selectedUnit.label !== u.label) e.currentTarget.style.background='transparent' }}
                  >
                    {u.label}
                    <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{Math.round(food.calories * u.multiplier)} kcal</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom quantity input */}
        {(isGramBased || isMlBased) && (
          <div style={{ marginBottom:22 }}>
            <label style={{ fontSize:'0.75rem', color:'var(--text-2)', fontWeight:600, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Or enter exact amount ({isGramBased ? 'grams' : 'ml'})
            </label>
            <input
              type="number"
              value={customQty}
              onChange={e => setCustomQty(e.target.value)}
              placeholder={isGramBased ? 'e.g. 175' : 'e.g. 330'}
              className="input-field"
              onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
              onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
            />
          </div>
        )}

        {/* Confirm button */}
        <button className="btn-primary" onClick={() => onConfirm(food, scaled, servingLabel)} style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'0.9rem' }}>
          <Check size={15} /> Add to {meal} · {scaled.calories} kcal
        </button>
      </div>
    </div>
  )
}

// ── Food search result row ─────────────────────────────────────────────────
function FoodItem({ food, onSelect }) {
  return (
    <div
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'11px 14px', borderRadius:'var(--radius-sm)',
        background:'var(--bg-3)', border:'1px solid var(--border)',
        transition:'all 0.15s', cursor:'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.background='var(--bg-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-3)'; }}
      onClick={() => onSelect(food)}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'0.875rem', fontWeight:500, marginBottom:2 }}>{food.name}</div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-3)', display:'flex', gap:8, flexWrap:'wrap' }}>
          <span style={{ color:'var(--accent)', fontWeight:600 }}>{food.calories} kcal</span>
          <span>P:{food.protein}g</span>
          <span>C:{food.carbs}g</span>
          <span>F:{food.fat}g</span>
          <span>· {food.serving}</span>
        </div>
      </div>
      <div style={{
        width:30, height:30, borderRadius:8, marginLeft:10, flexShrink:0,
        background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.25)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'var(--accent)',
      }}>
        <Plus size={15} />
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function FoodTracker() {
  const { user, profile } = useAuth()
  const { logs, addFood, removeFood, totals } = useFoodLog(user?.id)
  const [query, setQuery]                 = useState('')
  const [activeMeal, setActiveMeal]       = useState('Breakfast')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedFood, setSelectedFood]   = useState(null)   // food awaiting qty pick
  const [customForm, setCustomForm]       = useState(false)
  const [custom, setCustom]               = useState({ name:'', calories:'', protein:'', carbs:'', fat:'', serving:'1 serving' })

  const allCategories = ['All', ...CATEGORIES]

  const filtered = FOOD_DB.filter(f => {
    const matchQuery = !query.trim() || f.name.toLowerCase().includes(query.toLowerCase())
    const matchCat   = activeCategory === 'All' || f.category === activeCategory
    return matchQuery && matchCat
  }).slice(0, 18)

  async function handleConfirm(food, scaled, servingLabel) {
    await addFood({
      food_name:    food.name,
      calories:     scaled.calories,
      protein:      scaled.protein,
      carbs:        scaled.carbs,
      fat:          scaled.fat,
      serving_size: servingLabel,
      meal_type:    activeMeal,
    })
    setSelectedFood(null)
  }

  async function handleCustomAdd() {
    if (!custom.name || !custom.calories) return
    await addFood({
      food_name:    custom.name,
      calories:     parseFloat(custom.calories),
      protein:      parseFloat(custom.protein) || 0,
      carbs:        parseFloat(custom.carbs)   || 0,
      fat:          parseFloat(custom.fat)     || 0,
      serving_size: custom.serving,
      meal_type:    activeMeal,
    })
    setCustom({ name:'', calories:'', protein:'', carbs:'', fat:'', serving:'1 serving' })
    setCustomForm(false)
  }

  const mealLogs = (meal) => logs.filter(l => l.meal_type === meal)

  return (
    <div style={{ padding:'28px 36px', maxWidth:1120, margin:'0 auto' }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Food Tracker</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginTop:4 }}>
            {FOOD_DB.length}+ foods · tap any food to set quantity before adding
          </p>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {[
            { label:'Calories', val:Math.round(totals.calories), of:profile?.calories||2000, color:'var(--accent)' },
            { label:'Protein',  val:Math.round(totals.protein)+'g', of:(profile?.protein||150)+'g', color:'var(--blue)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'10px 16px' }}>
              <div style={{ fontSize:'1.1rem', fontWeight:800, color:s.color, fontFamily:'var(--font-display)' }}>{s.val}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)' }}>{s.label} · of {s.of}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:24 }}>

        {/* ── LEFT: Search & add ── */}
        <div>
          {/* Meal pills */}
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {MEAL_TYPES.map(m => (
              <button key={m} onClick={() => setActiveMeal(m)} style={{
                padding:'8px 14px', borderRadius:100,
                background: activeMeal === m ? 'var(--accent)' : 'var(--bg-3)',
                color: activeMeal === m ? '#07070f' : 'var(--text-2)',
                border: `1px solid ${activeMeal === m ? 'transparent' : 'var(--border)'}`,
                fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
                transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                transform: activeMeal === m ? 'scale(1.04)' : 'scale(1)',
              }}>{MEAL_ICONS[m]} {m}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position:'relative', marginBottom:10 }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search MaxProtein, paneer, oats, chicken…"
              className="input-field"
              style={{ paddingLeft:38 }}
              onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
              onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
            />
          </div>

          {/* Category filter */}
          <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding:'4px 11px', borderRadius:100, whiteSpace:'nowrap', flexShrink:0,
                background: activeCategory === cat ? 'var(--blue)' : 'var(--bg-3)',
                color: activeCategory === cat ? '#fff' : 'var(--text-3)',
                border: `1px solid ${activeCategory === cat ? 'transparent' : 'var(--border)'}`,
                fontSize:'0.7rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              }}>{cat}</button>
            ))}
          </div>

          {/* Hint */}
          <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ background:'var(--accent-dim)', color:'var(--accent)', padding:'2px 8px', borderRadius:100, fontWeight:600, fontSize:'0.68rem' }}>Tip</span>
            Tap a food to choose quantity and unit before adding
          </div>

          {/* Results list */}
          <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight:420, overflowY:'auto', paddingRight:2 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px', color:'var(--text-3)', fontSize:'0.875rem' }}>
                No results for "{query}"
                <div style={{ fontSize:'0.78rem', marginTop:6 }}>Try the custom food option below</div>
              </div>
            ) : (
              filtered.map(food => (
                <FoodItem key={food.name + food.category} food={food} onSelect={setSelectedFood} />
              ))
            )}
          </div>

          {/* Custom food toggle */}
          <button onClick={() => setCustomForm(!customForm)} style={{
            width:'100%', marginTop:12, padding:'10px',
            background:'transparent', border:'1px dashed var(--border)',
            borderRadius:'var(--radius-sm)', color:'var(--text-3)',
            fontSize:'0.82rem', cursor:'pointer', transition:'all 0.15s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.color='var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-3)'; }}
          >
            <Plus size={13} /> Add custom food
          </button>

          {customForm && (
            <div className="card" style={{ marginTop:10, padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              <h4 style={{ fontSize:'0.875rem', fontWeight:700 }}>Custom Food</h4>
              {[
                { key:'name',     label:'Food name',   type:'text' },
                { key:'calories', label:'Calories',    type:'number' },
                { key:'protein',  label:'Protein (g)', type:'number' },
                { key:'carbs',    label:'Carbs (g)',   type:'number' },
                { key:'fat',      label:'Fat (g)',     type:'number' },
                { key:'serving',  label:'Serving',     type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'0.72rem', color:'var(--text-3)', display:'block', marginBottom:4 }}>{f.label}</label>
                  <input type={f.type} value={custom[f.key]}
                    onChange={e => setCustom(c => ({...c, [f.key]: e.target.value}))}
                    className="input-field" style={{ padding:'8px 12px', fontSize:'0.85rem' }}
                  />
                </div>
              ))}
              <button className="btn-primary" onClick={handleCustomAdd} style={{ justifyContent:'center', marginTop:4, fontSize:'0.85rem' }}>
                <Check size={13} /> Add to {activeMeal}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Today's log ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {MEAL_TYPES.map(meal => {
            const mLogs   = mealLogs(meal)
            const mCals   = Math.round(mLogs.reduce((s, l) => s + l.calories, 0))
            const mProtein = Math.round(mLogs.reduce((s, l) => s + (l.protein || 0), 0))
            const isActive = activeMeal === meal
            return (
              <div key={meal} className="card" style={{
                padding:18,
                border: isActive ? '1px solid rgba(200,245,90,0.25)' : '1px solid var(--border)',
                transition:'border-color 0.2s',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: mLogs.length ? 12 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span>{MEAL_ICONS[meal]}</span>
                    <h4 style={{ fontSize:'0.9rem', fontWeight:700 }}>{meal}</h4>
                    {isActive && <span style={{ fontSize:'0.65rem', background:'var(--accent-dim)', color:'var(--accent)', padding:'2px 8px', borderRadius:100, fontWeight:700 }}>Active</span>}
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    {mProtein > 0 && <span style={{ fontSize:'0.7rem', color:'var(--blue)', fontWeight:700 }}>{mProtein}g P</span>}
                    <span style={{ fontSize:'0.82rem', fontWeight:700, color: mCals > 0 ? 'var(--text-2)' : 'var(--text-3)' }}>
                      {mCals > 0 ? `${mCals} kcal` : '—'}
                    </span>
                  </div>
                </div>

                {mLogs.length === 0 ? (
                  <div style={{ fontSize:'0.78rem', color:'var(--text-3)', paddingTop: 2 }}>Nothing logged yet.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {mLogs.map(log => (
                      <div key={log.id} style={{
                        display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'9px 12px', background:'var(--bg-3)', borderRadius:'var(--radius-sm)',
                        transition:'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--bg-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='var(--bg-3)'}
                      >
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontSize:'0.82rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.food_name}</div>
                          <div style={{ fontSize:'0.68rem', color:'var(--text-3)', marginTop:2, display:'flex', gap:6 }}>
                            <span style={{ color:'var(--text-2)', fontWeight:500 }}>{log.serving_size}</span>
                            <span>·</span>
                            <span>P:{Math.round(log.protein||0)}g</span>
                            <span>C:{Math.round(log.carbs||0)}g</span>
                            <span>F:{Math.round(log.fat||0)}g</span>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, marginLeft:10 }}>
                          <span style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--accent)' }}>{Math.round(log.calories)}</span>
                          <button onClick={() => removeFood(log.id)} style={{
                            width:22, height:22, borderRadius:6,
                            background:'transparent', border:'1px solid var(--border)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:'var(--text-3)', cursor:'pointer', transition:'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='var(--red-dim)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.background='transparent'; }}
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

      {/* ── Quantity Modal ── */}
      {selectedFood && (
        <QuantityModal
          food={selectedFood}
          meal={activeMeal}
          onConfirm={handleConfirm}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  )
}
