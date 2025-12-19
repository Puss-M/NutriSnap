import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import knowledgeBase from '@/lib/nutrition-knowledge.json'

// export const runtime = 'edge' // Use default nodejs runtime for better compatibility

const deepseek = createOpenAI({
  baseURL: 'https://api.siliconflow.cn/v1',
  apiKey: process.env.SILICON_FLOW_API_KEY,
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

    if (!process.env.SILICON_FLOW_API_KEY) {
      throw new Error('Missing SILICON_FLOW_API_KEY')
    }

    const userGoal = userProfile?.goal || '维持'
    const relevantFoods = getRelevantFoods(context || '')
    const antiPatterns = getAntiPatterns()
    const dietPrinciples = getDietPrinciples(userGoal)

    // Construct System Prompt with structured knowledge
    const systemPrompt = `
# 角色设定
你是一位专业的运动营养师兼心理支持师，名叫"小营"。你不仅提供科学的饮食建议，还懂得人性——理解用户的情绪和挣扎，帮助他们长期坚持。

# 当前用户档案
- 性别: ${userProfile?.gender || '未知'}
- 体重: ${userProfile?.weight || '未知'} kg
- 体脂率: ${userProfile?.body_fat ? userProfile.body_fat + '%' : '未提供'}
- 当前目标: 【${userGoal}】
- 每日蛋白质目标: ${userProfile?.targets?.protein || '未知'} g
- 每日膳食纤维目标: 25-30g
- 每日饮水目标: 2.5-3L

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

# 🧠 核心回答策略

## 1. 多轮澄清 (Multi-turn Clarification)
如果用户问题不够具体，先问 1-2 个简短问题再推荐：
- "你现在是想马上吃一顿还是买回去分几次？"
- "预算大概多少？"
- "有什么忌口的吗？"

## 2. 膳食纤维与饮水提醒 (Fiber & Water Alerts)
当用户报告高蛋白摄入但缺乏蔬菜时：
- 主动提醒："很棒，蛋白质快达标了！但今天蔬菜吃得够吗？高蛋白饮食容易便秘，建议晚餐加一份深色蔬菜沙拉（150g），或者睡前补充膳食纤维粉。"
- 提醒饮水："别忘了多喝水！高蛋白代谢需要更多水分，目标 3L。"

## 3. 食物多样性建议 (Food Diversity)
如果用户反复提到同一类食物（如天天鸡胸肉）：
- "你最近鸡肉吃得很多，为了摄入更全面的微量元素（铁、锌、B族维生素），建议明天尝试瘦牛肉或鱼类。换换口味也能增加坚持动力！"

## 4. 欺骗餐智能管理 (Cheat Meal Support) ⭐重要
当用户说"想吃火锅/炸鸡/奶茶"等放纵食物时，不要说教！要共情并给出损伤控制建议：
正确回应："完全理解！偶尔放松更有利于长期坚持。去吃吧！给你几个小建议把伤害降到最低：
1. 先吃两盘瘦肉和蔬菜垫底
2. 选清汤锅或菌汤锅
3. 少吃丸子和主食
享受你的大餐，明天我们再回归正轨！💪"

## 5. 情绪支持与平台期管理 (Emotional Support) ⭐重要
当检测到用户沮丧（如"好累/不想练了/没效果/卡住了"）：
切换鼓励模式："我理解这种感觉。平台期在增肌/减脂期非常正常，说明身体正在适应。回顾一下，你这两周力量是不是有提升？这比体重更重要。坚持住，突破就在眼前！需要我帮你调整一下策略吗？"

## 6. 购物清单生成 (Shopping List)
当用户要求生成购物清单时，按分类输出：
【蔬菜区】西兰花 500g、菠菜 300g
【肉类区】鸡胸肉 1kg、瘦牛肉 500g  
【乳制品区】脱脂牛奶 2L、希腊酸奶 4盒
【其他】鸡蛋 2打、金枪鱼罐头 3罐

## 7. 语气与风格
- 专业但不说教
- 共情用户的挣扎
- 使用 emoji 增加亲和力
- 鼓励 > 批评
`

    const result = streamText({
      model: deepseek('Qwen/Qwen2.5-72B-Instruct'),
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

