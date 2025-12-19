import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Create server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface FoodLogData {
  device_id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  weight_g: number
  image_url?: string
  context_tag?: string
  confidence?: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { foods, device_id } = body as { foods: FoodLogData[], device_id: string }

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json({ error: 'No foods provided' }, { status: 400 })
    }

    const results = []
    
    for (const food of foods) {
      const { data, error } = await supabase
        .from('logs')
        .insert({
          device_id: device_id || food.device_id,
          food_name: food.food_name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          weight_g: food.weight_g,
          image_url: food.image_url,
          context_tag: food.context_tag,
          confidence: food.confidence,
          user_id: null // Allow anonymous users
        })
        .select()
        .single()

      if (error) {
        console.error('[Save Food] Error:', error)
        return NextResponse.json({ 
          error: error.message,
          details: error
        }, { status: 500 })
      }
      
      results.push(data)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Saved ${results.length} food(s)`,
      data: results 
    })

  } catch (error: any) {
    console.error('[Save Food] Exception:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
