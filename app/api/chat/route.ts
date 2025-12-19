import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import knowledgeBase from '@/lib/nutrition-knowledge.json'

// export const runtime = 'edge' // Use default nodejs runtime for better compatibility

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

// Map context to knowledge base tags
const contextToTag: Record<string, string> = {
  '便利店': 'convenience_store',
  '食堂': 'canteen',
  '外卖': 'online',
  '超市': 'supermarket',
}

// Generate structured food recommendations based on context
function getRelevantFoods(context: string): string {
  const tag = contextToTag[context] || 'convenience_store'
  const relevantFoods = knowledgeBase.highProteinFoods
    .filter(food => food.tags.includes(tag))
    .map(food => `- ${food.name}: 每100g含蛋白质${food.protein_per_100g || food.protein_per_unit}g，${food.notes}`)
    .join('\n')
  return relevantFoods || '暂无该场景的推荐食物'
}

// Generate anti-pattern warnings
function getAntiPatterns(): string {
  return knowledgeBase.antiPatterns
    .map(item => `- ⚠️ ${item.name}: ${item.warning}`)
    .join('\n')
}

// Get diet principles based on goal
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

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('Missing DEEPSEEK_API_KEY')
    }

    const userGoal = userProfile?.goal || '维持'
    const relevantFoods = getRelevantFoods(context || '')
    const antiPatterns = getAntiPatterns()
    const dietPrinciples = getDietPrinciples(userGoal)

    // Construct System Prompt with structured knowledge
    const systemPrompt = `
# 角色设定
你是一位专业的运动营养师，名叫"小营"。你的目标是根据用户的身体数据、当前目标和实时摄入进度，提供科学、可执行的饮食建议。

# 当前用户档案
- 性别: ${userProfile?.gender || '未知'}
- 体重: ${userProfile?.weight || '未知'} kg
- 体脂率: ${userProfile?.body_fat ? userProfile.body_fat + '%' : '未提供'}
- 当前目标: 【${userGoal}】
- 每日蛋白质目标: ${userProfile?.targets?.protein || '未知'} g

# 实时状态更新
用户今日尚未摄入的宏量缺口:
- 蛋白质: 【${Math.round(macroDeficit?.protein || 0)} g】 (优先级最高)
- 碳水: 【${Math.round(macroDeficit?.carbs || 0)} g】
- 脂肪: 【${Math.round(macroDeficit?.fat || 0)} g】

# 用户当前情境
用户现在位于：【${context || '未知地点'}】

# 📚 知识库 - 该场景下推荐的高蛋白食物
${relevantFoods}

# 📚 知识库 - ${userGoal}原则
${dietPrinciples}

# ⚠️ 避雷区 - 常见"假健康"食品警示
${antiPatterns}

# 🧠 回答策略
1. **优先澄清**: 如果用户的问题不够具体（如蛋白质缺口很大但未说明预算或时间限制），先用 1-2 个简短问题澄清需求，再给出推荐。
   例如："你现在是想马上吃一顿还是准备买回去分几次吃？预算有限制吗？"
2. **场景匹配**: 只推荐【当前场景】容易买到的食物。如果用户在便利店，不要推荐需要回家做的食材。
3. **引用数据**: 推荐时引用知识库中的具体数据（蛋白质含量、品牌等）。
4. **分餐提醒**: 如果蛋白质缺口 > 40g，提醒用户分 2-3 餐摄入以提高吸收率。
5. **避雷提示**: 如果用户提到"避雷区"中的食物，主动提醒风险并推荐替代品。
6. **语气**: 专业、亲切、鼓励。使用 emoji 增加亲和力。
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

