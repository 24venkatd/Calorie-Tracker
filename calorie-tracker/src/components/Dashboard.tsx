'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { DailySummary, NutrientGoals, User } from '@/types/database'
import { Plus, LogOut, Calendar, Settings } from 'lucide-react'
import FoodLogForm from './FoodLogForm'
import DailySummaryCard from './DailySummaryCard'
import HistoryView from './HistoryView'
import NutrientGoalsModal from './NutrientGoalsModal'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [nutrientGoals, setNutrientGoals] = useState<NutrientGoals | null>(null)
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchDailySummary = useCallback(async () => {
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
  }, [user, supabase])

  const fetchNutrientGoals = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('nutrient_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching nutrient goals:', error)
      return
    }
    if (data) {
      setNutrientGoals(data)
    }
  }, [user, supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user as User)
      setLoading(false)
    }
    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user as User ?? null)
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (user) {
      fetchDailySummary()
      fetchNutrientGoals()
    }
  }, [user, fetchDailySummary, fetchNutrientGoals])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleFoodAdded = () => {
    setShowFoodForm(false)
    fetchDailySummary()
  }

  const handleGoalsUpdated = () => {
    setShowSettings(false)
    fetchNutrientGoals()
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
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
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
              <DailySummaryCard 
                summary={dailySummary} 
                nutrientGoals={nutrientGoals}
              />
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Entries</h2>
                <div className="space-y-3">
                  {dailySummary.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-lg p-4 shadow-sm border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-black">{entry.food_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black">{entry.calories} cal</p>
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
      {/* Nutrient Goals Modal */}
      {showSettings && (
        <NutrientGoalsModal
          onClose={() => setShowSettings(false)}
          onGoalsSaved={handleGoalsUpdated}
          user={user}
        />
      )}
    </div>
  )
} 