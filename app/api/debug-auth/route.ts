import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasSilicon = !!process.env.SILICON_FLOW_API_KEY
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    status: 'Debug Check',
    timestamp: new Date().toISOString(),
    env_check: {
      SILICON_FLOW_API_KEY: hasSilicon ? '✅ Present' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? '✅ Present' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasSupabaseKey ? '✅ Present' : '❌ Missing',
    },
    build_info: 'Build with Qwen-7B for Speed Test'
  })
}
