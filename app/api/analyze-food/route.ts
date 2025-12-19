import { NextRequest, NextResponse } from 'next/server'
import { getSuggestedFoods, calculateNutrition } from '@/lib/nutrition-db'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface FoodItem {
  name: string
  weight_g: number
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
  tips: string
}

function getMockFoodData(context?: string): { foods: FoodItem[] } {
  console.log('[AI Fallback] Using mock data from nutrition database')
  
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
      confidence: 0.6,
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
    
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const apiKey = process.env.SILICON_FLOW_API_KEY
    if (!apiKey) {
      console.warn('[AI Service] SILICON_FLOW_API_KEY not configured, using mock data')
      return NextResponse.json({
        ...getMockFoodData(context),
        _useMock: true,
        _reason: 'API key not configured'
      })
    }

    console.log('[AI Service] Calling vision model for food recognition...')

    // Direct API call to SiliconFlow Vision Model
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-VL-7B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `请分析这张食物图片，用JSON格式返回结果。
格式: {"foods":[{"name":"食物名","weight_g":重量,"calories":热量,"protein":蛋白质,"carbs":碳水,"fat":脂肪,"confidence":0.8,"tips":"一句话点评"}]}
场景: ${context || '未知'}
只返回JSON，不要其他文字。`
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Service] Vision API error:', response.status, errorText)
      return NextResponse.json({
        ...getMockFoodData(context),
        _useMock: true,
        _reason: `API Error: ${response.status}`
      })
    }

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || ''
    
    console.log('[AI Service] Raw response:', aiContent)

    // Try to parse JSON from response
    try {
      // Extract JSON from response (it might have extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.foods && Array.isArray(parsed.foods)) {
          console.log('[AI Service] Successfully recognized foods:', parsed.foods.length)
          return NextResponse.json(parsed)
        }
      }
    } catch (parseError) {
      console.error('[AI Service] JSON parse error:', parseError)
    }

    // Fallback to mock if parsing fails
    return NextResponse.json({
      ...getMockFoodData(context),
      _useMock: true,
      _reason: 'AI response parse failed'
    })
    
  } catch (error: any) {
    console.error('[AI Service] Food recognition error:', error.message)
    
    return NextResponse.json({
      ...getMockFoodData(requestBody.context),
      _useMock: true,
      _reason: 'AI服务暂时不可用',
      _errorType: error.name || 'Unknown'
    })
  }
}
