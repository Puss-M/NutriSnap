// Common food items database for fast lookup and AI result validation
// 常见食物营养数据库

export interface FoodItem {
  id: string
  name: string
  category: string
  servingSizeG: number      // 标准份量(克)
  per100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  tags: string[]           // ['高蛋白', '低脂', '便利店']
  aliases?: string[]       // 别名，用于搜索
}

export const NUTRITION_DATABASE: FoodItem[] = [
  // 便利店 - 蛋白质来源
  {
    id: 'chicken_breast',
    name: '鸡胸肉',
    category: '肉类',
    servingSizeG: 200,
    per100g: { calories: 110, protein: 23, carbs: 0, fat: 1.5 },
    tags: ['高蛋白', '低脂', '便利店', '增肌'],
    aliases: ['鸡肉', '鸡胸']
  },
  {
    id: 'boiled_egg',
    name: '水煮蛋',
    category: '蛋类',
    servingSizeG: 50,
    per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    tags: ['高蛋白', '便利店', '早餐'],
    aliases: ['鸡蛋', '煮鸡蛋', '白煮蛋']
  },
  {
    id: 'tea_egg',
    name: '茶叶蛋',
    category: '蛋类',
    servingSizeG: 50,
    per100g: { calories: 144, protein: 13, carbs: 1.5, fat: 10 },
    tags: ['高蛋白', '便利店'],
    aliases: ['卤蛋']
  },
  {
    id: 'milk',
    name: '纯牛奶',
    category: '乳制品',
    servingSizeG: 250,
    per100g: { calories: 54, protein: 3.4, carbs: 5, fat: 3.2 },
    tags: ['便利店', '早餐', '蛋白质'],
    aliases: ['牛奶', '鲜奶']
  },
  {
    id: 'greek_yogurt',
    name: '希腊酸奶',
    category: '乳制品',
    servingSizeG: 150,
    per100g: { calories: 97, protein: 10, carbs: 3.6, fat: 5 },
    tags: ['高蛋白', '便利店', '低碳水'],
    aliases: ['酸奶', '优格']
  },
  
  // 便利店 - 主食
  {
    id: 'whole_wheat_bread',
    name: '全麦面包',
    category: '主食',
    servingSizeG: 100,
    per100g: { calories: 247, protein: 13, carbs: 41, fat: 3.4 },
    tags: ['便利店', '主食', '粗粮'],
    aliases: ['面包']
  },
  {
    id: 'sweet_potato',
    name: '烤红薯',
    category: '主食',
    servingSizeG: 200,
    per100g: { calories: 90, protein: 2, carbs: 21, fat: 0.2 },
    tags: ['便利店', '主食', '低脂', '粗粮'],
    aliases: ['红薯', '地瓜']
  },
  {
    id: 'corn',
    name: '玉米',
    category: '主食',
    servingSizeG: 200,
    per100g: { calories: 96, protein: 3.4, carbs: 21, fat: 1.5 },
    tags: ['便利店', '主食', '粗粮'],
    aliases: ['甜玉米', '水果玉米']
  },
  {
    id: 'instant_oats',
    name: '燕麦片',
    category: '主食',
    servingSizeG: 40,
    per100g: { calories: 367, protein: 13, carbs: 67, fat: 6.9 },
    tags: ['便利店', '主食', '粗粮', '早餐'],
    aliases: ['麦片', '即食燕麦']
  },
  
  // 食堂 - 主食
  {
    id: 'white_rice',
    name: '白米饭',
    category: '主食',
    servingSizeG: 200,
    per100g: { calories: 130, protein: 2.6, carbs: 28, fat: 0.3 },
    tags: ['食堂', '主食'],
    aliases: ['米饭', '大米饭']
  },
  {
    id: 'brown_rice',
    name: '糙米饭',
    category: '主食',
    servingSizeG: 200,
    per100g: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
    tags: ['食堂', '主食', '粗粮'],
    aliases: ['糙米']
  },
  {
    id: 'steamed_bun',
    name: '馒头',
    category: '主食',
    servingSizeG: 100,
    per100g: { calories: 221, protein: 7, carbs: 47, fat: 1.1 },
    tags: ['食堂', '主食'],
    aliases: ['白馒头']
  },
  
  // 食堂 - 菜肴
  {
    id: 'stir_fry_veg',
    name: '清炒时蔬',
    category: '蔬菜',
    servingSizeG: 150,
    per100g: { calories: 60, protein: 2, carbs: 8, fat: 2 },
    tags: ['食堂', '低卡', '蔬菜'],
    aliases: ['青菜', '炒菜']
  },
  {
    id: 'braised_tofu',
    name: '红烧豆腐',
    category: '豆制品',
    servingSizeG: 150,
    per100g: { calories: 120, protein: 8, carbs: 4, fat: 8 },
    tags: ['食堂', '蛋白质', '素食'],
    aliases: ['豆腐']
  },
  {
    id: 'steamed_fish',
    name: '清蒸鱼',
    category: '海鲜',
    servingSizeG: 150,
    per100g: { calories: 100, protein: 20, carbs: 0, fat: 2 },
    tags: ['食堂', '高蛋白', '低脂'],
    aliases: ['鱼', '蒸鱼']
  },
  {
    id: 'chicken_drumstick',
    name: '鸡腿',
    category: '肉类',
    servingSizeG: 150,
    per100g: { calories: 181, protein: 18, carbs: 0, fat: 12 },
    tags: ['食堂', '高蛋白'],
    aliases: ['烤鸡腿', '炸鸡腿']
  },
  
  // 外卖
  {
    id: 'chicken_salad',
    name: '鸡胸肉沙拉',
    category: '轻食',
    servingSizeG: 300,
    per100g: { calories: 85, protein: 12, carbs: 5, fat: 2.5 },
    tags: ['外卖', '减脂', '高蛋白', '低卡'],
    aliases: ['沙拉', '轻食']
  },
  {
    id: 'beef_noodles',
    name: '牛肉面',
    category: '面食',
    servingSizeG: 500,
    per100g: { calories: 120, protein: 8, carbs: 18, fat: 2 },
    tags: ['外卖', '主食'],
    aliases: ['面条', '拉面']
  },
  {
    id: 'fried_rice',
    name: '蛋炒饭',
    category: '米饭',
    servingSizeG: 350,
    per100g: { calories: 180, protein: 5, carbs: 28, fat: 5 },
    tags: ['外卖', '主食'],
    aliases: ['炒饭']
  },
  
  // 零食
  {
    id: 'banana',
    name: '香蕉',
    category: '水果',
    servingSizeG: 100,
    per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    tags: ['便利店', '水果', '运动'],
    aliases: ['芭蕉']
  },
  {
    id: 'apple',
    name: '苹果',
    category: '水果',
    servingSizeG: 200,
    per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    tags: ['便利店', '水果', '低卡'],
    aliases: []
  },
  {
    id: 'protein_bar',
    name: '蛋白棒',
    category: '补剂',
    servingSizeG: 60,
    per100g: { calories: 380, protein: 30, carbs: 40, fat: 10 },
    tags: ['便利店', '高蛋白', '运动', '增肌'],
    aliases: ['能量棒']
  }
]

/**
 * Search food by name or alias
 */
export function searchFood(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase().trim()
  
  return NUTRITION_DATABASE.filter(item => {
    // Match name
    if (item.name.toLowerCase().includes(lowerQuery)) return true
    
    // Match aliases
    if (item.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery))) return true
    
    // Match tags
    if (item.tags.some(tag => tag.includes(lowerQuery))) return true
    
    return false
  })
}

/**
 * Get food by ID
 */
export function getFoodById(id: string): FoodItem | undefined {
  return NUTRITION_DATABASE.find(item => item.id === id)
}

/**
 * Calculate nutrition for custom weight
 */
export function calculateNutrition(foodItem: FoodItem, weightG: number) {
  const factor = weightG / 100
  return {
    calories: Math.round(foodItem.per100g.calories * factor),
    protein: Math.round(foodItem.per100g.protein * factor * 10) / 10,
    carbs: Math.round(foodItem.per100g.carbs * factor * 10) / 10,
    fat: Math.round(foodItem.per100g.fat * factor * 10) / 10
  }
}

/**
 * Get foods by category/tag
 */
export function getFoodsByTag(tag: string): FoodItem[] {
  return NUTRITION_DATABASE.filter(item => item.tags.includes(tag))
}

/**
 * Get random food suggestions for a context
 */
export function getSuggestedFoods(context: string, count: number = 3): FoodItem[] {
  let pool: FoodItem[] = []
  
  switch (context) {
    case 'convenience_store':
      pool = getFoodsByTag('便利店')
      break
    case 'canteen':
      pool = getFoodsByTag('食堂')
      break
    case 'takeout':
      pool = getFoodsByTag('外卖')
      break
    default:
      pool = NUTRITION_DATABASE
  }
  
  // Shuffle and take first N
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
