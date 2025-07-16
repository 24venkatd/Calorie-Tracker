import { DailySummary, NutrientGoals } from '@/types/database'
import { BarChart3 } from 'lucide-react'

interface DailySummaryCardProps {
  summary: DailySummary
  nutrientGoals?: NutrientGoals | null
}

export default function DailySummaryCard({ summary, nutrientGoals }: DailySummaryCardProps) {
  const dailyGoal = 2000 // Default daily calorie goal
  const progressPercentage = Math.min((summary.total_calories / dailyGoal) * 100, 100)

  // Map NutrientGoals fields to expected keys for progress bars
  const goals = nutrientGoals
    ? {
        protein: nutrientGoals.protein_goal,
        fiber: nutrientGoals.fiber_goal,
        carbohydrates: nutrientGoals.carb_goal,
        sugar: nutrientGoals.sugar_goal,
        fats: nutrientGoals.fat_goal,
        saturated_fat: nutrientGoals.sat_fat_goal,
      }
    : {
        protein: 100,
        fiber: 30,
        carbohydrates: 250,
        sugar: 36,
        fats: 70,
        saturated_fat: 20,
      }

  // Calculate totals for each nutrient
  const totals = summary.entries.reduce(
    (acc, entry) => {
      acc.protein += entry.protein || 0
      acc.fiber += entry.fiber || 0
      acc.carbohydrates += entry.carbohydrates || 0
      acc.sugar += entry.sugar || 0
      acc.fats += entry.fats || 0
      acc.saturated_fat += entry.saturated_fat || 0
      return acc
    },
    { protein: 0, fiber: 0, carbohydrates: 0, sugar: 0, fats: 0, saturated_fat: 0 }
  )
  // Helper to render a progress bar
  const ProgressBar = ({ label, value, goal }: { label: string; value: number; goal: number }) => {
    const percent = Math.min((value / goal) * 100, 100)
    return (
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-700">{value} / {goal}g</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${percent > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Summary</h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">{summary.date}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Calories */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {summary.total_calories}
          </div>
          <div className="text-sm text-gray-600">Calories Consumed</div>
        </div>
        {/* Daily Goal */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-400">
            {dailyGoal}
          </div>
          <div className="text-sm text-gray-600">Daily Goal</div>
        </div>
        {/* Remaining */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${dailyGoal - summary.total_calories >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.max(0, dailyGoal - summary.total_calories)}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${progressPercentage > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
      {/* Nutrient Progress Bars */}
      <div className="mt-6">
        <ProgressBar label="Protein" value={totals.protein} goal={goals.protein ?? 0} />
        <ProgressBar label="Fiber" value={totals.fiber} goal={goals.fiber ?? 0} />
        <ProgressBar label="Carbohydrates" value={totals.carbohydrates} goal={goals.carbohydrates ?? 0} />
        <ProgressBar label="Sugar" value={totals.sugar} goal={goals.sugar ?? 0} />
        <ProgressBar label="Fats" value={totals.fats} goal={goals.fats ?? 0} />
        <ProgressBar label="Saturated Fat" value={totals.saturated_fat} goal={goals.saturated_fat ?? 0} />
      </div>
      {/* Entries Count */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          {summary.entries.length} food {summary.entries.length === 1 ? 'entry' : 'entries'} today
        </div>
      </div>
    </div>
  )
} 