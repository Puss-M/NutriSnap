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
        model: 'Qwen/Qwen2-VL-72B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `你是一个专业的营养分析师。请识别这张图片中的所有食物，并估算每种食物的营养成分。

要求：
1. 识别图片中的所有食物
2. 估算每种食物的重量(克)
3. 计算每种食物的热量(kcal)、蛋白质(g)、碳水化合物(g)、脂肪(g)
4. 给出0-1之间的置信度
5. 给出一句简短的饮食建议

必须严格按照以下JSON格式返回，不要添加任何其他文字：
{"foods":[{"name":"食物名称","weight_g":200,"calories":300,"protein":15,"carbs":30,"fat":10,"confidence":0.85,"tips":"这是一道高蛋白低脂的健康食物"}]}

场景信息: ${context || '未知场景'}
请开始分析：`
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 800,
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
