import { useState, useEffect } from 'react'
import { NutrientGoals } from '@/types/database'
import { createClientComponentClient } from '@/lib/supabase'
import { X } from 'lucide-react'

interface NutrientGoalsModalProps {
  user: { id: string }
  onClose: () => void
  onGoalsSaved: (goals: NutrientGoals) => void
  currentGoals?: NutrientGoals | null
}

const defaultGoals: NutrientGoals = {
  id: '',
  user_id: '',
  protein_goal: 100,
  fiber_goal: 30,
  carb_goal: 250,
  sugar_goal: 36,
  fat_goal: 70,
  sat_fat_goal: 20,
  calories_goal: 2000,
  created_at: '',
  updated_at: '',
}

export default function NutrientGoalsModal({ user, onClose, onGoalsSaved, currentGoals }: NutrientGoalsModalProps) {
  const [goals, setGoals] = useState<NutrientGoals | null>(currentGoals || null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!goals && user) {
      fetchGoals()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchGoals = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('nutrient_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) setGoals(data)
    setLoading(false)
  }

  const handleChange = (field: keyof NutrientGoals, value: number) => {
    setGoals((prev) => ({ ...prev, [field]: value } as NutrientGoals))
  }

  const handleSave = async () => {
    setLoading(true)
    let result
    if (goals && goals.id) {
      // Update
      const { data } = await supabase
        .from('nutrient_goals')
        .update({
          ...goals,
          user_id: user.id,
        })
        .eq('id', goals.id)
        .select()
        .single()
      result = data
    } else {
      // Insert
      const { data } = await supabase
        .from('nutrient_goals')
        .insert({
          ...defaultGoals,
          ...goals,
          user_id: user.id,
        })
        .select()
        .single()
      result = data
    }
    setLoading(false)
    if (result) {
      setGoals(result)
      onGoalsSaved(result)
      onClose()
    }
  }

  const g = goals || defaultGoals

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Set Daily Nutrient Goals</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                <input
                  type="number"
                  value={g.protein_goal || ''}
                  onChange={(e) => handleChange('protein_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fiber (g)</label>
                <input
                  type="number"
                  value={g.fiber_goal || ''}
                  onChange={(e) => handleChange('fiber_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carbohydrates (g)</label>
                <input
                  type="number"
                  value={g.carb_goal || ''}
                  onChange={(e) => handleChange('carb_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sugar (g)</label>
                <input
                  type="number"
                  value={g.sugar_goal || ''}
                  onChange={(e) => handleChange('sugar_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fats (g)</label>
                <input
                  type="number"
                  value={g.fat_goal || ''}
                  onChange={(e) => handleChange('fat_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Saturated Fat (g)</label>
                <input
                  type="number"
                  value={g.sat_fat_goal || ''}
                  onChange={(e) => handleChange('sat_fat_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                <input
                  type="number"
                  value={g.calories_goal || ''}
                  onChange={(e) => handleChange('calories_goal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 