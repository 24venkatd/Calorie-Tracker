export interface CalorieEntry {
  id: string
  user_id: string
  food_name: string
  calories: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface DailySummary {
  date: string
  total_calories: number
  entries: CalorieEntry[]
}

export interface FoodRecognitionResult {
  food_name: string
  estimated_calories: number
  confidence: number
} 