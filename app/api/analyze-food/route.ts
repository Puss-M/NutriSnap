import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { FOOD_RECOGNITION_PROMPT } from '@/lib/prompts'
import { getSuggestedFoods, calculateNutrition } from '@/lib/nutrition-db'

// Schema for food recognition
const foodSchema = z.object({
  foods: z.array(z.object({
    name: z.string(),
    weight_g: z.number(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    confidence: z.number(),
    tips: z.string()
  }))
})

/**
 * Generate mock food data from database when AI is unavailable
 */
function getMockFoodData(context?: string): z.infer<typeof foodSchema> {
  console.log('[AI Fallback] Using mock data from nutrition database')
  
  // Get 1-3 suggested foods based on context
  const suggested = getSuggestedFoods(context || '', Math.floor(Math.random() * 2) + 1)
  
  const foods = suggested.map(item => {
    const nutrition = calculateNutrition(item, item.servingSizeG)
    return {
      name: item.name,
      weight_g: item.servingSizeG,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      confidence: 0.6, // Mock confidence
      tips: `${item.category} - ${item.tags.join('、')}`
    }
  })
  
  return { foods }
}

export async function POST(req: NextRequest) {
  let requestBody: { image?: string; context?: string } = {}
  
  try {
    requestBody = await req.json()
    const { image, context } = requestBody
    
    // Input validation
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Check API key
    if (!process.env.SILICON_FLOW_API_KEY) {
      console.warn('[AI Service] SILICON_FLOW_API_KEY not configured, using mock data')
      return NextResponse.json({
        ...getMockFoodData(context),
        _useMock: true,
        _reason: 'API key not configured'
      })
    }

    // Using Silicon Flow API (OpenAI-compatible)
    const model = openai('Pro/Qwen/Qwen2-VL-72B-Instruct', {
      baseURL: 'https://api.siliconflow.cn/v1',
      apiKey: process.env.SILICON_FLOW_API_KEY
    })

    console.log('[AI Service] Calling vision model for food recognition...')
    
    const result = await generateObject({
      model,
      schema: foodSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: FOOD_RECOGNITION_PROMPT(context) },
            { type: 'image', image }
          ]
        }
      ],
      maxRetries: 2,  // Retry up to 2 times on failure
    })

    console.log('[AI Service] Successfully recognized foods:', result.object.foods.length)
    return NextResponse.json(result.object)
    
  } catch (error: any) {
    // Detailed error logging
    console.error('[AI Service] Food recognition error:', {
      error: error.message,
      name: error.name,
      cause: error.cause,
      context: requestBody.context
    })
    
    // Graceful degradation: return mock data instead of error
    console.log('[AI Service] Falling back to mock data due to error')
    
    return NextResponse.json({
      ...getMockFoodData(requestBody.context),
      _useMock: true,
      _reason: 'AI服务暂时不可用',
      _errorType: error.name || 'Unknown'
    })
  }
}
