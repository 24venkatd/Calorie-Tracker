export interface CalorieEntry {
  id: string
  user_id: string
  food_name: string
  calories: number
  image_url?: string
  created_at: string
  updated_at: string
  protein?: number
  fiber?: number
  carbohydrates?: number
  sugar?: number
  fats?: number
  saturated_fat?: number
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

export interface NutrientGoals {
  id: string
  user_id: string
  protein_goal?: number
  fiber_goal?: number
  carb_goal?: number
  sugar_goal?: number
  fat_goal?: number
  sat_fat_goal?: number
  calories_goal?: number
  created_at: string
  updated_at: string
} 