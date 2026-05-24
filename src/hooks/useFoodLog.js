import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export function useFoodLog(userId, date = new Date()) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .order('created_at', { ascending: true })
    setLogs(data || [])
    setLoading(false)
  }, [userId, dateStr])

  useEffect(() => { fetch() }, [fetch])

  async function addFood(entry) {
    const { data, error } = await supabase.from('food_logs').insert({
      user_id: userId,
      date: dateStr,
      ...entry,
    }).select().single()
    if (!error) setLogs(prev => [...prev, data])
    return { data, error }
  }

  async function removeFood(id) {
    const { error } = await supabase.from('food_logs').delete().eq('id', id)
    if (!error) setLogs(prev => prev.filter(l => l.id !== id))
  }

  const totals = logs.reduce((acc, log) => ({
    calories: acc.calories + (log.calories || 0),
    protein: acc.protein + (log.protein || 0),
    carbs: acc.carbs + (log.carbs || 0),
    fat: acc.fat + (log.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return { logs, loading, addFood, removeFood, totals, refresh: fetch }
}

export function useStreak(userId) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!userId) return
    async function calcStreak() {
      const { data } = await supabase
        .from('food_logs')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (!data?.length) return
      const uniqueDates = [...new Set(data.map(d => d.date))].sort().reverse()
      let count = 0
      let expected = format(new Date(), 'yyyy-MM-dd')
      for (const d of uniqueDates) {
        if (d === expected) { count++; const dt = new Date(d); dt.setDate(dt.getDate()-1); expected = format(dt,'yyyy-MM-dd') }
        else break
      }
      setStreak(count)
    }
    calcStreak()
  }, [userId])

  return streak
}
