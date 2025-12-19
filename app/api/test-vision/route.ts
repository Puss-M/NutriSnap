import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  const apiKey = process.env.SILICON_FLOW_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'SILICON_FLOW_API_KEY 未配置'
    }, { status: 500 })
  }
  
  try {
    // Test with a simple food image URL
    const testImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Pro/Qwen/Qwen2-VL-72B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '这张图片里有什么食物？用一句话回答。' },
              { type: 'image_url', image_url: { url: testImageUrl } }
            ]
          }
        ],
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        status: response.status,
        error: `Vision API Error: ${response.statusText}`,
        details: errorText
      }, { status: 500 })
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || '(无返回)'

    return NextResponse.json({
      success: true,
      message: '🎉 Vision API 连接成功!',
      aiResponse: aiMessage,
      model: 'Qwen/Qwen2.5-VL-7B-Instruct'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `请求失败: ${error.message}`
    }, { status: 500 })
  }
}
