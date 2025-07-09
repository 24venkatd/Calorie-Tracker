import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Use OpenAI GPT-4 Vision for food recognition
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `
      Analyze this food image and provide:
      1. The name of the food item
      2. An estimated calorie count for a typical serving
      
      Please respond in JSON format:
      {
        "food_name": "food item name",
        "estimated_calories": number,
        "confidence": number (0-1)
      }
      
      Be specific with food names and provide realistic calorie estimates.
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis result received' },
        { status: 500 }
      )
    }

    // Parse the JSON response from GPT-4
    let result
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        result = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      return NextResponse.json(
        { error: 'Failed to parse analysis result' },
        { status: 500 }
      )
    }

    // Validate the result
    if (!result.food_name || !result.estimated_calories) {
      return NextResponse.json(
        { error: 'Invalid analysis result format' },
        { status: 500 }
      )
    }

    // Ensure calories is a number and within reasonable range
    const calories = Math.max(0, Math.min(5000, Number(result.estimated_calories) || 0))
    const confidence = Math.max(0, Math.min(1, Number(result.confidence) || 0.5))

    return NextResponse.json({
      food_name: result.food_name,
      estimated_calories: Math.round(calories),
      confidence: confidence
    })

  } catch (error) {
    console.error('Food recognition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 