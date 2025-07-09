'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, X, Check, Edit } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { FoodRecognitionResult } from '@/types/database'

interface FoodLogFormProps {
  onClose: () => void
  onFoodAdded: () => void
  user: any
}

export default function FoodLogForm({ onClose, onFoodAdded, user }: FoodLogFormProps) {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [recognitionResult, setRecognitionResult] = useState<FoodRecognitionResult | null>(null)
  const [calories, setCalories] = useState<number>(0)
  const [foodName, setFoodName] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [step, setStep] = useState<'upload' | 'recognition' | 'confirm'>('upload')
  
  const supabase = createClientComponentClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setStep('recognition')
      processImage(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const processImage = async (file: File) => {
    setIsProcessing(true)
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName)

      // Call AI recognition API
      const response = await fetch('/api/recognize-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: publicUrl,
          fileName: fileName
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to recognize food')
      }

      const result = await response.json()
      setRecognitionResult(result)
      setFoodName(result.food_name)
      setCalories(result.estimated_calories)
      setStep('confirm')
    } catch (error) {
      console.error('Error processing image:', error)
      // Fallback to manual entry
      setStep('confirm')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (!foodName || calories <= 0) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('calorie_entries')
        .insert({
          user_id: user.id,
          food_name: foodName,
          calories: calories,
          image_url: imagePreview
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
    setImage(null)
    setImagePreview(null)
    setRecognitionResult(null)
    setCalories(0)
    setFoodName('')
    setStep('upload')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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

          {step === 'upload' && (
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop a food image, or click to select'}
                </p>
                <p className="text-sm text-gray-500">
                  Take a photo of your food or select from gallery
                </p>
              </div>
            </div>
          )}

          {step === 'recognition' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your food image...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRetake}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Recognition Result */}
              {recognitionResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Food Recognized!</span>
                  </div>
                  <p className="text-green-700">
                    Detected: <span className="font-semibold">{recognitionResult.food_name}</span>
                  </p>
                  <p className="text-green-700">
                    Estimated: <span className="font-semibold">{recognitionResult.estimated_calories} calories</span>
                  </p>
                </div>
              )}

              {/* Manual Entry Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter food name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter calories"
                    min="0"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!foodName || calories <= 0 || isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 