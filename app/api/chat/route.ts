import { NextResponse } from 'next/server'
import knowledgeBase from '@/lib/nutrition-knowledge.json'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Map context to knowledge base tags
const contextToTag: Record<string, string> = {
  '便利店': 'convenience_store',
  '食堂': 'canteen',
  '外卖': 'online',
  '超市': 'supermarket',
}

function getRelevantFoods(context: string): string {
  const tag = contextToTag[context] || 'convenience_store'
  const relevantFoods = knowledgeBase.highProteinFoods
    .filter(food => food.tags.includes(tag))
    .map(food => `- ${food.name}: 每100g含蛋白质${food.protein_per_100g || food.protein_per_unit}g，${food.notes}`)
    .join('\n')
  return relevantFoods || '暂无该场景的推荐食物'
}

function getAntiPatterns(): string {
  return knowledgeBase.antiPatterns
    .map(item => `- ⚠️ ${item.name}: ${item.warning}`)
    .join('\n')
}

function getDietPrinciples(goal: string): string {
  if (goal === '增肌') {
    return knowledgeBase.dietPrinciples.muscle_gain.map(p => `- ${p}`).join('\n')
  } else if (goal === '减脂') {
    return knowledgeBase.dietPrinciples.fat_loss.map(p => `- ${p}`).join('\n')
  }
  return '- 均衡饮食，控制热量摄入'
}

export async function POST(req: Request) {
  try {
    const { messages, context, macroDeficit, userProfile } = await req.json()

    const apiKey = process.env.SILICON_FLOW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing SILICON_FLOW_API_KEY' }, { status: 500 })
    }

    const userGoal = userProfile?.goal || '维持'
    const relevantFoods = getRelevantFoods(context || '')
    const antiPatterns = getAntiPatterns()
    const dietPrinciples = getDietPrinciples(userGoal)

    const systemPrompt = `你是专业营养师"小营"。用户目标: ${userGoal}。
蛋白质缺口: ${Math.round(macroDeficit?.protein || 0)}g
场景: ${context || '未知'}
推荐食物:
${relevantFoods}
${userGoal}原则:
${dietPrinciples}
避雷区:
${antiPatterns}
要求：简洁友好，2-3句话，用emoji`

    // Direct API call to SiliconFlow
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SiliconFlow API error:', response.status, errorText)
      return NextResponse.json({ error: `API Error: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答。'

    return new Response(aiMessage, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
    
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
