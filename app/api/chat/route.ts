import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

// export const runtime = 'edge' // Use default nodejs runtime for better compatibility

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

// Simulated Knowledge Base (RAG)
// In a real production app, this would be retrieved from a vector database
const DIET_KNOWLEDGE_BASE = `
【饮食参考表 - 便利店/超市高蛋白精选】
1. 即食鸡胸肉/鸡腿排: 每100g含蛋白质约25-30g。推荐品牌：优形、肌肉小王子。
2. 脱脂牛奶: 每100ml含蛋白质3.2-3.6g。推荐：光明、伊利。
3. 希腊酸奶: 每100g含蛋白质8-10g。推荐：简爱、吾岛。
4. 卤鸡蛋/茶叶蛋: 每个含蛋白质6-7g。
5. 蛋白棒: 每根含蛋白质15-20g。推荐：PhD、Quest。
6. 豆浆: 每100ml含蛋白质3.0g。推荐：永和。
7. 金枪鱼罐头 (水浸): 每100g含蛋白质20-25g。

【饮食原则 - 增肌篇】
1. 热量盈余: 每日摄入 > TDEE + 300kcal。
2. 碳水充足: 训练前后必须补充碳水，促进胰岛素分泌和糖原恢复。
3. 蛋白质分餐: 每餐摄入25-30g蛋白质吸收效率最高，不要一顿吃完。

【饮食原则 - 减脂篇】
1. 热量缺口: 每日摄入 < TDEE - 500kcal。
2. 高蛋白: 防止肌肉流失，利用食物热效应。
3. 把控油脂: 严格控制烹饪油和隐形脂肪（如坚果、沙拉酱）。
`

export async function POST(req: Request) {
  try {
    const { messages, context, macroDeficit, userProfile } = await req.json()

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('Missing DEEPSEEK_API_KEY')
    }

    // Construct System Prompt with specific user context
    const systemPrompt = `
# 角色设定
你是一位专业的运动营养师。你的目标是根据用户的身体数据、当前目标和实时摄入进度，提供科学、可执行的饮食建议。

# 知识库来源
${DIET_KNOWLEDGE_BASE}

# 当前用户档案
- 性别: ${userProfile?.gender || '未知'}
- 体重: ${userProfile?.weight || '未知'} kg
- 当前目标: 【${userProfile?.goal || '维持'}】
- 每日蛋白质目标: ${userProfile?.targets?.protein || '未知'} g

# 实时状态更新
用户今日尚未摄入的宏量缺口:
- 蛋白质: 【${Math.round(macroDeficit?.protein || 0)} g】 (优先级最高)
- 碳水: 【${Math.round(macroDeficit?.carbs || 0)} g】
- 脂肪: 【${Math.round(macroDeficit?.fat || 0)} g】

# 用户当前情境
用户现在位于：【${context || '未知地点'}】 (例如：便利店、食堂、外卖)

# 回答要求
1. 直接针对用户的【蛋白质缺口】和【地点】推荐具体的食物组合。
2. 推荐的食物必须是该地点容易买到的。
3. 如果缺口过大（如>40g蛋白质），提醒用户分餐摄入。
4. 引用【饮食参考表】中的数据支持推荐。
5. 语气专业、亲切、鼓励。
`

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
    
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
