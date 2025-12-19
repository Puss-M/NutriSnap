import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15 // 15 second timeout

export async function GET() {
  const apiKey = process.env.SILICON_FLOW_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'SILICON_FLOW_API_KEY 未配置',
      help: '请在 Vercel 环境变量中添加此 Key'
    }, { status: 500 })
  }
  
  try {
    // Simple test call to SiliconFlow
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [{ role: 'user', content: '说 "测试成功"' }],
        max_tokens: 20,
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        status: response.status,
        error: `API 返回错误: ${response.statusText}`,
        details: errorText,
        help: response.status === 401 ? 'API Key 无效或已过期' : 
              response.status === 429 ? '请求太快或余额不足' :
              response.status === 402 ? '账户余额不足' : '未知错误'
      }, { status: 500 })
    }
    
    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || '(无返回内容)'
    
    return NextResponse.json({
      success: true,
      message: '🎉 API 连接成功!',
      aiResponse: aiMessage,
      model: 'Qwen/Qwen2.5-7B-Instruct',
      keyPresent: true
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `请求失败: ${error.message}`,
      help: '可能是网络问题或 API 服务器不可用'
    }, { status: 500 })
  }
}
