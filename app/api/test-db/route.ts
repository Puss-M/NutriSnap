import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing Supabase credentials',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    }, { status: 500 })
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Try to insert a test record
    const testData = {
      device_id: 'test-device-' + Date.now(),
      food_name: 'Test Food',
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 5,
      weight_g: 100,
      user_id: null
    }
    
    const { data, error } = await supabase
      .from('logs')
      .insert(testData)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    // If successful, delete the test record
    if (data?.id) {
      await supabase.from('logs').delete().eq('id', data.id)
    }
    
    return NextResponse.json({
      success: true,
      message: '🎉 数据库连接成功！可以正常保存数据。',
      testRecord: data
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
