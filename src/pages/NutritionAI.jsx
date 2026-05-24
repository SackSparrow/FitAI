import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { Send, Bot, User, Zap, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  "I have 600 calories left for dinner. What should I eat?",
  "I need more protein today. What foods do you suggest?",
  "Give me a high protein breakfast under 400 calories.",
  "What's a good post-workout meal for muscle gain?",
  "I'm trying to bulk on a budget. Meal ideas?",
  "Am I on track with my macros today?",
]

function buildSystemPrompt(profile, totals) {
  const remaining = (profile?.calories || 2000) - totals.calories
  const proteinLeft = (profile?.protein || 150) - totals.protein
  const carbsLeft = (profile?.carbs || 200) - totals.carbs
  const fatLeft = (profile?.fat || 65) - totals.fat

  return `You are FitAI Nutrition Coach, a smart, friendly, and knowledgeable personal nutrition assistant.

USER PROFILE:
- Name: ${profile?.name || 'User'}
- Goal: ${profile?.goal?.replace('_', ' ') || 'improve fitness'}
- Daily Calorie Target: ${profile?.calories || 2000} kcal
- Protein Target: ${profile?.protein || 150}g
- Carbs Target: ${profile?.carbs || 200}g
- Fat Target: ${profile?.fat || 65}g
- Dietary Preference: ${profile?.dietary_preference || 'none'}
- Experience Level: ${profile?.experience || 'beginner'}

TODAY'S PROGRESS (real-time):
- Calories consumed: ${Math.round(totals.calories)} kcal (${Math.round(remaining)} remaining)
- Protein consumed: ${Math.round(totals.protein)}g (${Math.round(proteinLeft)}g remaining)
- Carbs consumed: ${Math.round(totals.carbs)}g (${Math.round(carbsLeft)}g remaining)
- Fats consumed: ${Math.round(totals.fat)}g (${Math.round(fatLeft)}g remaining)

INSTRUCTIONS:
- Be specific, practical, and encouraging
- Suggest real foods with approximate macros
- Always consider remaining calories/macros when suggesting meals
- Respect dietary preferences
- Keep responses concise but helpful (2-4 sentences max for simple questions, more for complex ones)
- Use emojis sparingly for a friendly feel
- If asked about today's progress, reference the real-time data above
- Never suggest going over calorie goals unless user explicitly asks about bulking`
}

export default function NutritionAI() {
  const { profile } = useAuth()
  const { user } = useAuth()
  const { totals } = useFoodLog(user?.id)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${profile?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI Nutrition Coach. I can see your real-time calorie and macro data for today. Ask me anything about meals, nutrition, or how to hit your goals!`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: buildSystemPrompt(profile, totals),
          messages: [...history, { role: 'user', content: userMsg }],
        }),
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Sorry, I had trouble responding. Try again!'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't connect right now. Please check your API key configuration and try again." }])
    }
    setLoading(false)
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', padding:'32px 40px', maxWidth:800, margin:'0 auto', width:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ width:42, height:42, background:'var(--blue-dim)', border:'1px solid rgba(90,143,255,0.3)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Bot size={22} color="var(--blue)" />
        </div>
        <div>
          <h1 style={{ fontSize:'1.2rem', fontWeight:800 }}>AI Nutrition Coach</h1>
          <p style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>Aware of your real-time calorie & macro data</p>
        </div>
        {/* Live stats pill */}
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(200,245,90,0.2)', borderRadius:100, padding:'6px 14px', fontSize:'0.75rem', color:'var(--accent)', fontWeight:600 }}>
            <Zap size={11} style={{ marginRight:4, display:'inline' }} />
            {Math.round((profile?.calories||2000) - totals.calories)} kcal left
          </div>
          <div style={{ background:'var(--blue-dim)', border:'1px solid rgba(90,143,255,0.2)', borderRadius:100, padding:'6px 14px', fontSize:'0.75rem', color:'var(--blue)', fontWeight:600 }}>
            {Math.round((profile?.protein||150) - totals.protein)}g protein left
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16, paddingBottom:16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display:'flex', gap:12,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems:'flex-start',
          }}>
            <div style={{
              width:32, height:32, borderRadius:10, flexShrink:0,
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--blue-dim)',
              border: msg.role === 'assistant' ? '1px solid rgba(90,143,255,0.3)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {msg.role === 'user' ? <User size={16} color="#0a0a0f" /> : <Bot size={16} color="var(--blue)" />}
            </div>
            <div style={{
              maxWidth:'75%', padding:'12px 16px',
              background: msg.role === 'user' ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(200,245,90,0.2)' : 'var(--border)'}`,
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              fontSize:'0.875rem', lineHeight:1.65, color:'var(--text)',
              whiteSpace:'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'var(--blue-dim)', border:'1px solid rgba(90,143,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={16} color="var(--blue)" />
            </div>
            <div style={{ padding:'12px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'4px 16px 16px 16px' }}>
              <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:6, height:6, borderRadius:'50%', background:'var(--text-3)',
                    animation:'pulse 1.2s ease infinite',
                    animationDelay:`${i*0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <Sparkles size={12} /> Try asking...
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{
                padding:'6px 12px', background:'var(--bg-3)', border:'1px solid var(--border)',
                borderRadius:100, fontSize:'0.78rem', color:'var(--text-2)', cursor:'pointer',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.borderColor='var(--border-hover)'; e.target.style.color='var(--text)' }}
              onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-2)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display:'flex', gap:10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about meals, macros, or your goals..."
          disabled={loading}
          style={{
            flex:1, background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius)', padding:'12px 16px', color:'var(--text)',
            fontSize:'0.9rem', transition:'border 0.2s',
          }}
          onFocus={e => e.target.style.borderColor='var(--blue)'}
          onBlur={e => e.target.style.borderColor='var(--border)'}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
          width:46, height:46, borderRadius:'var(--radius)',
          background: input.trim() ? 'var(--blue)' : 'var(--bg-3)',
          border: 'none', display:'flex', alignItems:'center', justifyContent:'center',
          cursor: input.trim() ? 'pointer' : 'default', transition:'all 0.2s', flexShrink:0,
        }}>
          <Send size={18} color={input.trim() ? '#fff' : 'var(--text-3)'} />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
