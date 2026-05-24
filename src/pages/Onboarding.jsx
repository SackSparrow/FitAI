import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, Check, Zap } from 'lucide-react'

const STEPS = ['basics', 'body', 'goal', 'lifestyle', 'diet']

const goals = [
  { id:'lose_weight', label:'Lose Weight', emoji:'🔥' },
  { id:'maintain', label:'Maintain Weight', emoji:'⚖️' },
  { id:'bulk', label:'Bulk / Gain Mass', emoji:'💪' },
  { id:'gain_muscle', label:'Gain Muscle', emoji:'🏋️' },
  { id:'improve_fitness', label:'Improve Fitness', emoji:'🏃' },
]

const activityLevels = [
  { id:'sedentary', label:'Sedentary', desc:'Little to no exercise' },
  { id:'light', label:'Lightly Active', desc:'Light exercise 1–3 days/week' },
  { id:'moderate', label:'Moderately Active', desc:'Exercise 3–5 days/week' },
  { id:'very', label:'Very Active', desc:'Hard exercise 6–7 days/week' },
  { id:'extra', label:'Extremely Active', desc:'Twice daily or physical job' },
]

const experienceLevels = [
  { id:'beginner', label:'Beginner', desc:'< 1 year' },
  { id:'intermediate', label:'Intermediate', desc:'1–3 years' },
  { id:'advanced', label:'Advanced', desc:'3+ years' },
]

const equipmentOptions = [
  { id:'full_gym', label:'Full Gym', emoji:'🏢' },
  { id:'home', label:'Home Workout', emoji:'🏠' },
  { id:'dumbbells', label:'Dumbbells Only', emoji:'🏋️' },
  { id:'none', label:'No Equipment', emoji:'🤸' },
]

const dietOptions = [
  { id:'none', label:'No restrictions' },
  { id:'vegetarian', label:'Vegetarian' },
  { id:'vegan', label:'Vegan' },
  { id:'keto', label:'Keto' },
  { id:'paleo', label:'Paleo' },
  { id:'gluten_free', label:'Gluten-free' },
  { id:'dairy_free', label:'Dairy-free' },
]

// Harris-Benedict TDEE
function calculateTDEE(profile) {
  const { age, gender, weight_kg, height_cm, activity_level, goal } = profile
  let bmr = gender === 'male'
    ? 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
    : 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)

  const multipliers = { sedentary:1.2, light:1.375, moderate:1.55, very:1.725, extra:1.9 }
  let tdee = Math.round(bmr * (multipliers[activity_level] || 1.55))

  if (goal === 'lose_weight') tdee -= 500
  if (goal === 'bulk') tdee += 400
  if (goal === 'gain_muscle') tdee += 200

  const protein = Math.round(weight_kg * (goal === 'bulk' || goal === 'gain_muscle' ? 2.2 : 1.8))
  const fat = Math.round((tdee * 0.25) / 9)
  const carbs = Math.round((tdee - (protein * 4) - (fat * 9)) / 4)

  return { calories: tdee, protein, carbs, fat }
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name:'', age:'', gender:'male',
    height_cm:'', weight_kg:'', target_weight_kg:'',
    goal:'lose_weight', activity_level:'moderate', experience:'beginner',
    equipment:'full_gym', dietary_preference:'none',
  })
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuth()
  const navigate = useNavigate()

  function set(key, val) { setData(d => ({ ...d, [key]: val })) }

  async function finish() {
    setLoading(true)
    const macros = calculateTDEE({ ...data, age: parseInt(data.age), weight_kg: parseFloat(data.weight_kg), height_cm: parseFloat(data.height_cm) })
    await updateProfile({ ...data, ...macros, onboarding_complete: true })
    navigate('/dashboard')
  }

  const canNext = () => {
    if (step === 0) return data.name.trim()
    if (step === 1) return data.age && data.height_cm && data.weight_kg && data.target_weight_kg
    return true
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40, justifyContent:'center' }}>
          <div style={{ width:32, height:32, background:'var(--accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={16} color="#0a0a0f" fill="#0a0a0f" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800 }}>FitAI</span>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:6, marginBottom:32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex:1, height:4, borderRadius:4,
              background: i <= step ? 'var(--accent)' : 'var(--bg-3)',
              transition:'background 0.3s',
            }} />
          ))}
        </div>

        <div className="card" style={{ padding:32 }}>
          {/* Step 0: Name */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>What's your name?</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:28 }}>Let's make this personal.</p>
              <input value={data.name} onChange={e => set('name', e.target.value)}
                placeholder="Your name"
                style={{ width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'12px 16px', color:'var(--text)', fontSize:'1rem' }}
                onFocus={e => e.target.style.borderColor='var(--accent)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
              <div style={{ marginTop:20 }}>
                <label style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'block', marginBottom:8 }}>Gender</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['male','female','other'].map(g => (
                    <button key={g} onClick={() => set('gender', g)} style={{
                      flex:1, padding:'10px', borderRadius:'var(--radius-sm)', fontWeight:500,
                      background: data.gender === g ? 'var(--accent-dim)' : 'var(--bg-3)',
                      border: `1px solid ${data.gender === g ? 'var(--accent)' : 'var(--border)'}`,
                      color: data.gender === g ? 'var(--accent)' : 'var(--text-2)',
                      textTransform:'capitalize', fontSize:'0.875rem',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Body */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>Your body stats</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:28 }}>Used to calculate your personalized goals.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { key:'age', label:'Age (years)', placeholder:'25' },
                  { key:'height_cm', label:'Height (cm)', placeholder:'175' },
                  { key:'weight_kg', label:'Current Weight (kg)', placeholder:'75' },
                  { key:'target_weight_kg', label:'Target Weight (kg)', placeholder:'70' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:'0.75rem', color:'var(--text-2)', display:'block', marginBottom:6 }}>{f.label}</label>
                    <input type="number" value={data[f.key]} onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ width:'100%', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)', fontSize:'0.9rem' }}
                      onFocus={e => e.target.style.borderColor='var(--accent)'}
                      onBlur={e => e.target.style.borderColor='var(--border)'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>What's your main goal?</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:24 }}>This shapes your calorie and macro targets.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {goals.map(g => (
                  <button key={g.id} onClick={() => set('goal', g.id)} style={{
                    display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
                    background: data.goal === g.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.goal === g.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)', color: data.goal === g.id ? 'var(--accent)' : 'var(--text)',
                    textAlign:'left', fontSize:'0.9rem', fontWeight:500, transition:'all 0.15s',
                  }}>
                    <span style={{ fontSize:'1.2rem' }}>{g.emoji}</span>
                    {g.label}
                    {data.goal === g.id && <Check size={16} style={{ marginLeft:'auto' }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>Your lifestyle</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:20 }}>Helps calculate your daily calorie needs.</p>
              
              <label style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'block', marginBottom:10 }}>Activity Level</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                {activityLevels.map(a => (
                  <button key={a.id} onClick={() => set('activity_level', a.id)} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px',
                    background: data.activity_level === a.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.activity_level === a.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)', color: data.activity_level === a.id ? 'var(--accent)' : 'var(--text)',
                    textAlign:'left', transition:'all 0.15s',
                  }}>
                    <span style={{ fontWeight:500, fontSize:'0.875rem' }}>{a.label}</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{a.desc}</span>
                  </button>
                ))}
              </div>

              <label style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'block', marginBottom:10 }}>Experience Level</label>
              <div style={{ display:'flex', gap:10 }}>
                {experienceLevels.map(e => (
                  <button key={e.id} onClick={() => set('experience', e.id)} style={{
                    flex:1, padding:'10px 8px',
                    background: data.experience === e.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.experience === e.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)', color: data.experience === e.id ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.8rem', fontWeight:500, transition:'all 0.15s',
                  }}>
                    <div>{e.label}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:2 }}>{e.desc}</div>
                  </button>
                ))}
              </div>

              <label style={{ fontSize:'0.8rem', color:'var(--text-2)', display:'block', margin:'20px 0 10px' }}>Equipment Access</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {equipmentOptions.map(eq => (
                  <button key={eq.id} onClick={() => set('equipment', eq.id)} style={{
                    padding:'12px',
                    background: data.equipment === eq.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.equipment === eq.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)', color: data.equipment === eq.id ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.85rem', fontWeight:500, transition:'all 0.15s',
                  }}>
                    <span style={{ fontSize:'1.1rem', display:'block', marginBottom:4 }}>{eq.emoji}</span>
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Diet */}
          {step === 4 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>Dietary preferences</h2>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:24 }}>The AI coach will personalize meal suggestions accordingly.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {dietOptions.map(d => (
                  <button key={d.id} onClick={() => set('dietary_preference', d.id)} style={{
                    padding:'8px 16px',
                    background: data.dietary_preference === d.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${data.dietary_preference === d.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:100, color: data.dietary_preference === d.id ? 'var(--accent)' : 'var(--text-2)',
                    fontSize:'0.85rem', fontWeight:500, transition:'all 0.15s',
                  }}>
                    {data.dietary_preference === d.id && '✓ '}{d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:32 }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-ghost" style={{ opacity: step === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={16} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn-primary" onClick={finish} disabled={loading}>
                {loading ? <div className="spinner" /> : <>Let's go! <Zap size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
