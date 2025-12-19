// NutriSnap Application Configuration
// 集中管理所有配置常量，避免硬编码

export const APP_CONFIG = {
  // Activity Factors (活动系数)
  // 用于计算 TDEE (Total Daily Energy Expenditure)
  ACTIVITY_FACTORS: {
    '久坐 (几乎不运动)': 1.2,
    '轻度活动 (每周1-3次)': 1.375,
    '中度活动 (每周3-5次)': 1.55,
    '高度活动 (每周6-7次)': 1.725,
    '专业运动员': 1.9
  } as const,

  // Macro Nutrient Configurations by Goal
  // 根据目标配置宏量营养素
  MACRO_CONFIGS: {
    '增肌': {
      calorieSurplus: 400,        // +400 kcal
      proteinPerKg: 2.2,          // 2.2g/kg体重
      fatRatio: 0.25              // 总热量的25%来自脂肪
    },
    '减脂': {
      calorieDeficit: 400,        // -400 kcal
      proteinPerKg: 2.4,          // 更高蛋白保护肌肉
      fatRatio: 0.25
    },
    '维持': {
      calorieAdjustment: 0,       // 不调整
      proteinPerKg: 1.8,
      fatRatio: 0.28
    }
  } as const,

  // Input Validation Ranges
  // 用户输入验证范围
  VALIDATION: {
    weight: { min: 30, max: 200, unit: 'kg' },
    height: { min: 100, max: 250, unit: 'cm' },
    age: { min: 10, max: 100, unit: '岁' }
  },

  // Paywall Settings
  // 付费墙配置
  PAYWALL: {
    freeTrialLimit: 3,            // 3次免费试用
    vipFeatures: [
      '无限次AI分析',
      '高级营养建议',
      '数据导出功能',
      '优先客服支持'
    ]
  },

  // Default User Profile
  // 默认用户档案（用于新用户）
  DEFAULT_PROFILE: {
    weight: 55,
    height: 164,
    age: 20,
    gender: '女' as const,
    activityLevel: '中度活动 (每周3-5次)' as const,
    goal: '维持' as const,
    caloriesTarget: 2000
  }
} as const

// Type exports for TypeScript
export type ActivityLevel = keyof typeof APP_CONFIG.ACTIVITY_FACTORS
export type Goal = keyof typeof APP_CONFIG.MACRO_CONFIGS
export type Gender = '男' | '女'
