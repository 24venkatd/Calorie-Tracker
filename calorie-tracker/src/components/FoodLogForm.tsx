'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, X } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import Image from 'next/image'

interface FoodLogFormProps {
  onClose: () => void
  onFoodAdded: () => void
  user: { id: string }
}

export default function FoodLogForm({ onClose, onFoodAdded, user }: FoodLogFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [calories, setCalories] = useState<number>(0)
  const [foodName, setFoodName] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [step, setStep] = useState<'upload' | 'recognition' | 'confirm'>('upload')
  const [protein, setProtein] = useState<number>(0)
  const [fiber, setFiber] = useState<number>(0)
  const [carbohydrates, setCarbohydrates] = useState<number>(0)
  const [sugar, setSugar] = useState<number>(0)
  const [fats, setFats] = useState<number>(0)
  const [saturatedFat, setSaturatedFat] = useState<number>(0)
  const supabase = createClientComponentClient()

  const processImage = useCallback(async (file: File) => {
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName)

      // Call the recognition API
      const response = await fetch('/api/recognize-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: publicUrl }),
      })

      if (response.ok) {
        const result = await response.json()
        setFoodName(result.food_name)
        setCalories(result.estimated_calories)
        setProtein(result.protein || 0)
        setFiber(result.fiber || 0)
        setCarbohydrates(result.carbohydrates || 0)
        setSugar(result.sugar || 0)
        setFats(result.fats || 0)
        setSaturatedFat(result.saturated_fat || 0)
        setStep('recognition')
      } else {
        console.error('Recognition failed')
        setStep('confirm')
      }
    } catch (error) {
      console.error('Error processing image:', error)
      // Fallback to manual entry
      setStep('confirm')
    }
  }, [user.id, supabase])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      processImage(file)
    }
  }, [processImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('calorie_entries')
        .insert({
          user_id: user.id,
          food_name: foodName,
          calories: calories,
          protein: protein,
          fiber: fiber,
          carbohydrates: carbohydrates,
          sugar: sugar,
          fats: fats,
          saturated_fat: saturatedFat,
        })

      if (error) {
        console.error('Error saving entry:', error)
        return
      }

      onFoodAdded()
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetake = () => {
    setImagePreview(null)
    setCalories(0)
    setFoodName('')
    setProtein(0)
    setFiber(0)
    setCarbohydrates(0)
    setSugar(0)
    setFats(0)
    setSaturatedFat(0)
    setStep('upload')
  }

  if (step === 'upload') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Food</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop the image here...'
                  : 'Drag & drop a food image, or click to select'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'recognition') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Recognition Result</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {imagePreview && (
              <div className="mb-4">
                <Image
                  src={imagePreview}
                  alt="Food preview"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="0"
                />
              </div>

              {/* Nutrient fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiber (g)</label>
                  <input
                    type="number"
                    value={fiber}
                    onChange={(e) => setFiber(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbohydrates}
                    onChange={(e) => setCarbohydrates(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugar (g)</label>
                  <input
                    type="number"
                    value={sugar}
                    onChange={(e) => setSugar(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sat Fat (g)</label>
                  <input
                    type="number"
                    value={saturatedFat}
                    onChange={(e) => setSaturatedFat(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleRetake}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Retake Photo
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 