import { DailySummary } from '@/types/database'
import { BarChart3, Target } from 'lucide-react'

interface DailySummaryCardProps {
  summary: DailySummary
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const dailyGoal = 2000 // Default daily calorie goal
  const progressPercentage = Math.min((summary.total_calories / dailyGoal) * 100, 100)
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Today's Summary</h2>
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
            className={`h-3 rounded-full transition-all duration-300 ${
              progressPercentage > 100 ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
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