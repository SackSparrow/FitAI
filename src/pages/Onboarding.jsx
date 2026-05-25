import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, Check, Activity, Zap } from 'lucide-react'

const STEPS = ['basics','body','goal','lifestyle','diet']
const STEP_LABELS = ['About you','Your body','Your goal','Lifestyle','Diet']

const goals = [
  { id:'lose_weight',     label:'Lose Weight',     emoji:'🔥', desc:'Calorie deficit plan' },
  { id:'maintain',        label:'Maintain Weight',  emoji:'⚖️', desc:'Balanced approach' },
  { id:'bulk',            label:'Bulk / Gain Mass', emoji:'💪', desc:'Calorie surplus plan' },
  { id:'gain_muscle',     label:'Gain Muscle',      emoji:'🏋️', desc:'High protein focus' },
  { id:'improve_fitness', label:'Improve Fitness',  emoji:'🏃', desc:'Performance goals' },
]

const activityLevels = [
  { id:'sedentary', label:'Sedentary',         desc:'Little to no exercise' },
  { id:'light',     label:'Lightly Active',    desc:'1–3 days/week' },
  { id:'moderate',  label:'Moderately Active', desc:'3–5 days/week' },
  { id:'very',      label:'Very Active',       desc:'6–7 days/week' },
  { id:'extra',     label:'Extremely Active',  desc:'Twice daily / physical job' },
]

const experienceLevels = [
  { id:'beginner',     label:'Beginner',     desc:'< 1 year' },
  { id:'intermediate', label:'Intermediate', desc:'1–3 years' },
  { id:'advanced',     label:'Advanced',     desc:'3+ years' },
]

const equipmentOptions = [
  { id:'full_gym',  label:'Full Gym',       emoji:'🏢' },
  { id:'home',      label:'Home Workout',   emoji:'🏠' },
  { id:'dumbbells', label:'Dumbbells Only', emoji:'🏋️' },
  { id:'none',      label:'No Equipment',   emoji:'🤸' },
]

const dietOptions = [
  { id:'none',        label:'No restrictions' },
  { id:'vegetarian',  label:'🥗 Vegetarian' },
  { id:'vegan',       label:'🌿 Vegan' },
  { id:'keto',        label:'🥑 Keto' },
  { id:'paleo',       label:'🥩 Paleo' },
  { id:'gluten_free', label:'🌾 Gluten-free' },
  { id:'dairy_free',  label:'🥛 Dairy-free' },
]

function calculateTDEE(profile) {
  const { age, gender, weight_kg, height_cm, activity_level, goal } = profile
  let bmr = gender === 'male'
    ? 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
    : 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)
  const mults = { sedentary:1.2, light:1.375, moderate:1.55, very:1.725, extra:1.9 }
  let tdee = Math.round(bmr * (mults[activity_level] || 1.55))
  if (goal === 'lose_weight') tdee -= 500
  if (goal === 'bulk')        tdee += 400
  if (goal === 'gain_muscle') tdee += 200
  const protein = Math.round(weight_kg * (goal === 'bulk' || goal === 'gain_muscle' ? 2.2 : 1.8))
  const fat     = Math.round((tdee * 0.25) / 9)
  const carbs   = Math.round((tdee - (protein * 4) - (fat * 9)) / 4)
  return { calories: tdee, protein, carbs, fat }
}

function OptionBtn({ selected, onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px', width:'100%', textAlign:'left',
      background: selected ? 'var(--accent-dim)' : 'var(--bg-3)',
      border: `1px solid ${selected ? 'rgba(200,245,90,0.4)' : 'var(--border)'}`,
      borderRadius:'var(--radius-sm)',
      color: selected ? 'var(--accent)' : 'var(--text-2)',
      fontSize:'0.875rem', fontWeight: selected ? 600 : 400,
      transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      transform: selected ? 'scale(1.01)' : 'scale(1)',
      ...style,
    }}>
      {children}
      {selected && <Check size={14} style={{ marginLeft:'auto', flexShrink:0 }} />}
    </button>
  )
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name:'', age:'', gender:'male',
    height_cm:'', weight_kg:'', target_weight_kg:'',
    goal:'lose_weight', activity_level:'moderate',
    experience:'beginner', equipment:'full_gym', dietary_preference:'none',
  })
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  async function finish() {
    setLoading(true)
    const macros = calculateTDEE({ ...data, age:parseInt(data.age), weight_kg:parseFloat(data.weight_kg), height_cm:parseFloat(data.height_cm) })
    await updateProfile({ ...data, ...macros, onboarding_complete:true })
    navigate('/dashboard')
  }

  const canNext = () => {
    if (step === 0) return data.name.trim()
    if (step === 1) return data.age && data.height_cm && data.weight_kg && data.target_weight_kg
    return true
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, position:'relative' }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:600, height:300, background:'radial-gradient(ellipse, rgba(200,245,90,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:540 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40, justifyContent:'center' }}>
          <div style={{ width:34, height:34, background:'var(--accent)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(200,245,90,0.3)' }}>
            <Activity size={18} color="#07070f" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>
            Calor<span style={{ color:'var(--accent)' }}>IQ</span>
          </span>
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:4,
              background: i < step ? 'var(--accent)' : i === step ? 'rgba(200,245,90,0.5)' : 'var(--bg-3)',
              transition:'background 0.35s ease',
            }} />
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:28 }}>
          {STEPS.map((_, i) => (
            <span key={i} style={{ fontSize:'0.68rem', color: i <= step ? 'var(--accent)' : 'var(--text-3)', fontWeight: i === step ? 600 : 400, transition:'color 0.3s', flex:1, textAlign:'center' }}>
              {STEP_LABELS[i]}
            </span>
          ))}
        </div>

        <div className="card anim-scale-in" style={{ padding:32 }} key={step}>

          {/* Step 0 — Name */}
          {step === 0 && (
            <div className="anim-fade-up">
              <h2 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>What's your name?</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:28 }}>Let's make this personal.</p>
              <input value={data.name} onChange={e => set('name', e.target.value)}
                placeholder="Your first name"
                className="input-field"
                style={{ fontSize:'1rem', padding:'14px 16px' }}
                onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
                autoFocus
              />
              <div style={{ marginTop:22 }}>
                <label style={{ fontSize:'0.78rem', color:'var(--text-2)', display:'block', marginBottom:10, fontWeight:500 }}>Gender</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['male','female','other'].map(g => (
                    <button key={g} onClick={() => set('gender', g)} style={{
                      flex:1, padding:'10px', borderRadius:'var(--radius-sm)', fontWeight:500,
                      background: data.gender === g ? 'var(--accent-dim)' : 'var(--bg-3)',
                      border: `1px solid ${data.gender === g ? 'rgba(200,245,90,0.4)' : 'var(--border)'}`,
                      color: data.gender === g ? 'var(--accent)' : 'var(--text-2)',
                      textTransform:'capitalize', fontSize:'0.875rem',
                      transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                      transform: data.gender === g ? 'scale(1.02)' : 'scale(1)',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Body */}
          {step === 1 && (
            <div className="anim-fade-up">
              <h2 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>Your body stats</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:28 }}>Used to calculate your personalised calorie goal.</p>
              <div className="stagger" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { key:'age',              label:'Age (years)',           placeholder:'25' },
                  { key:'height_cm',        label:'Height (cm)',           placeholder:'175' },
                  { key:'weight_kg',        label:'Current weight (kg)',   placeholder:'75' },
                  { key:'target_weight_kg', label:'Target weight (kg)',    placeholder:'70' },
                ].map(f => (
                  <div key={f.key} className="anim-fade-up">
                    <label style={{ fontSize:'0.75rem', color:'var(--text-2)', display:'block', marginBottom:7, fontWeight:500 }}>{f.label}</label>
                    <input type="number" value={data[f.key]} onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="input-field"
                      onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(200,245,90,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Goal */}
          {step === 2 && (
            <div className="anim-fade-up">
              <h2 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>What's your main goal?</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:24 }}>This shapes your calorie and macro targets.</p>
              <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {goals.map(g => (
                  <OptionBtn key={g.id} selected={data.goal === g.id} onClick={() => set('goal', g.id)} style={{}} className="anim-fade-up">
                    <span style={{ fontSize:'1.3rem' }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontWeight:600 }}>{g.label}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:1 }}>{g.desc}</div>
                    </div>
                  </OptionBtn>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Lifestyle */}
          {step === 3 && (
            <div className="anim-fade-up">
              <h2 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>Your lifestyle</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:20 }}>Helps calculate your daily calorie needs accurately.</p>

              <label style={{ fontSize:'0.78rem', color:'var(--text-2)', display:'block', marginBottom:9, fontWeight:500 }}>Activity Level</label>
              <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:22 }}>
                {activityLevels.map(a => (
                  <OptionBtn key={a.id} selected={data.activity_level === a.id} onClick={() => set('activity_level', a.id)} className="anim-fade-up">
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{a.label}</span>
                      <span style={{ fontSize:'0.76rem', color:'var(--text-3)', marginLeft:8 }}>{a.desc}</span>
                    </div>
                  </OptionBtn>
                ))}
              </div>

              <label style={{ fontSize:'0.78rem', color:'var(--text-2)', display:'block', marginBottom:9, fontWeight:500 }}>Experience Level</label>
              <div style={{ display:'flex', gap:10, marginBottom:22 }}>
                {experienceLevels.map(e => (
                  <button key={e.id} onClick={() => set('experience', e.id)} style={{
                    flex:1, padding:'11px 8px', textAlign:'center',
                    background: data.experience === e.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.experience === e.id ? 'rgba(200,245,90,0.4)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)',
                    color: data.experience === e.id ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.82rem', fontWeight: data.experience === e.id ? 600 : 400,
                    transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: data.experience === e.id ? 'scale(1.02)' : 'scale(1)',
                  }}>
                    <div>{e.label}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:3 }}>{e.desc}</div>
                  </button>
                ))}
              </div>

              <label style={{ fontSize:'0.78rem', color:'var(--text-2)', display:'block', marginBottom:9, fontWeight:500 }}>Equipment Access</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                {equipmentOptions.map(eq => (
                  <button key={eq.id} onClick={() => set('equipment', eq.id)} style={{
                    padding:'13px', textAlign:'center',
                    background: data.equipment === eq.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.equipment === eq.id ? 'rgba(200,245,90,0.4)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)',
                    color: data.equipment === eq.id ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.85rem', fontWeight: data.equipment === eq.id ? 600 : 400,
                    transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: data.equipment === eq.id ? 'scale(1.02)' : 'scale(1)',
                  }}>
                    <span style={{ fontSize:'1.2rem', display:'block', marginBottom:5 }}>{eq.emoji}</span>
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Diet */}
          {step === 4 && (
            <div className="anim-fade-up">
              <h2 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>Dietary preferences</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:24 }}>Your AI coach will personalise meal suggestions accordingly.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:9 }}>
                {dietOptions.map(d => (
                  <button key={d.id} onClick={() => set('dietary_preference', d.id)} style={{
                    padding:'9px 18px',
                    background: data.dietary_preference === d.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.dietary_preference === d.id ? 'rgba(200,245,90,0.4)' : 'var(--border)'}`,
                    borderRadius:100,
                    color: data.dietary_preference === d.id ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.85rem', fontWeight: data.dietary_preference === d.id ? 600 : 400,
                    transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: data.dietary_preference === d.id ? 'scale(1.04)' : 'scale(1)',
                  }}>
                    {data.dietary_preference === d.id && '✓ '}{d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:34, gap:12 }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-ghost" style={{ opacity: step === 0 ? 0.3 : 1, gap:6 }}>
              <ChevronLeft size={15} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ flex:1, justifyContent:'center' }}>
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button className="btn-primary" onClick={finish} disabled={loading} style={{ flex:1, justifyContent:'center' }}>
                {loading ? <div className="spinner" /> : <><Zap size={15} /> Let's go!</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
