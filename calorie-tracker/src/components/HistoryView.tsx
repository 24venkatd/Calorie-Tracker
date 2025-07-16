'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { CalorieEntry } from '@/types/database'
import { ArrowLeft, Calendar } from 'lucide-react'
import Image from 'next/image'

interface HistoryViewProps {
  user: { id: string }
  onBack: () => void
}

export default function HistoryView({ user, onBack }: HistoryViewProps) {
  const [entries, setEntries] = useState<CalorieEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('calorie_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching history:', error)
      return
    }

    setEntries(data || [])
    setLoading(false)
  }, [user.id, supabase])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const groupEntriesByDate = (entries: CalorieEntry[]) => {
    const groups: { [key: string]: CalorieEntry[] } = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
    })
    
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }

  const calculateDailyTotal = (entries: CalorieEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.calories, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">History</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  const groupedEntries = groupEntriesByDate(entries)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600">Start tracking your food to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedEntries.map(([date, dayEntries]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatDate(date)}
                    </h2>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateDailyTotal(dayEntries)}
                      </div>
                      <div className="text-sm text-gray-600">calories</div>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {entry.image_url && (
                          <div className="flex-shrink-0">
                            <Image
                              src={entry.image_url}
                              alt={entry.food_name}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {entry.food_name}
                            </h3>
                            <div className="text-right">
                              <div className="text-xl font-semibold text-gray-900">
                                {entry.calories} cal
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(entry.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Nutrient breakdown */}
                          {(entry.protein || entry.fiber || entry.carbohydrates || entry.sugar || entry.fats || entry.saturated_fat) && (
                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                              {entry.protein && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Protein:</span> {entry.protein}g
                                </div>
                              )}
                              {entry.fiber && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Fiber:</span> {entry.fiber}g
                                </div>
                              )}
                              {entry.carbohydrates && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Carbs:</span> {entry.carbohydrates}g
                                </div>
                              )}
                              {entry.sugar && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Sugar:</span> {entry.sugar}g
                                </div>
                              )}
                              {entry.fats && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Fats:</span> {entry.fats}g
                                </div>
                              )}
                              {entry.saturated_fat && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Sat Fat:</span> {entry.saturated_fat}g
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 