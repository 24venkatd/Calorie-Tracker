'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { CalorieEntry, DailySummary } from '@/types/database'
import { Camera, Plus, LogOut, Calendar, BarChart3 } from 'lucide-react'
import FoodLogForm from './FoodLogForm'
import DailySummaryCard from './DailySummaryCard'
import HistoryView from './HistoryView'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchDailySummary()
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchDailySummary()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchDailySummary = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    const { data: entries, error } = await supabase
      .from('calorie_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching entries:', error)
      return
    }

    const totalCalories = entries?.reduce((sum, entry) => sum + entry.calories, 0) || 0
    
    setDailySummary({
      date: today,
      total_calories: totalCalories,
      entries: entries || []
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleFoodAdded = () => {
    setShowFoodForm(false)
    fetchDailySummary()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Calorie Tracker</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Calendar className="w-5 h-5" />
                <span>History</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {showHistory ? (
          <HistoryView user={user} onBack={() => setShowHistory(false)} />
        ) : (
          <>
            {/* Daily Summary */}
            {dailySummary && (
              <DailySummaryCard summary={dailySummary} />
            )}

            {/* Add Food Button */}
            <div className="mt-8">
              <button
                onClick={() => setShowFoodForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span>Add Food</span>
              </button>
            </div>

            {/* Recent Entries */}
            {dailySummary?.entries && dailySummary.entries.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Entries</h2>
                <div className="space-y-3">
                  {dailySummary.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-lg p-4 shadow-sm border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{entry.food_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{entry.calories} cal</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Food Log Form Modal */}
      {showFoodForm && (
        <FoodLogForm
          onClose={() => setShowFoodForm(false)}
          onFoodAdded={handleFoodAdded}
          user={user}
        />
      )}
    </div>
  )
} 