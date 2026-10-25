import { describe, expect, it } from 'vitest'

import {
  calculateBMI,
  calculateBMR,
  calculateBMR_KatchMcArdle,
  calculateMacroDeficit,
  calculateNutritionTargets,
  calculateTDEE,
  getBMICategory,
  getBMIColor,
  validateUserMetrics,
  type UserMetrics,
} from '../calculators'

const male: UserMetrics = {
  weight: 70,
  height: 175,
  age: 25,
  gender: '男',
  activityLevel: '中度活动 (每周3-5次)',
  goal: '维持',
}

const female: UserMetrics = {
  weight: 55,
  height: 160,
  age: 28,
  gender: '女',
  activityLevel: '轻度活动 (每周1-3次)',
  goal: '减脂',
}

describe('calculateBMI', () => {
  it('按 kg/m² 计算并保留一位小数', () => {
    expect(calculateBMI(70, 175)).toBe(22.9)
    expect(calculateBMI(50, 160)).toBe(19.5)
  })
})

describe('getBMICategory / getBMIColor', () => {
  it('按中国标准分段', () => {
    expect(getBMICategory(17)).toBe('偏瘦')
    expect(getBMICategory(22)).toBe('正常')
    expect(getBMICategory(25)).toBe('偏胖')
    expect(getBMICategory(30)).toBe('肥胖')
  })

  it('颜色映射与分段一致', () => {
    expect(getBMIColor(17)).toBe('text-blue-500')
    expect(getBMIColor(30)).toBe('text-red-500')
  })
})

describe('calculateBMR (Mifflin-St Jeor)', () => {
  it('男性: 10W + 6.25H - 5A + 5', () => {
    // 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMR(male)).toBe(1674)
  })

  it('女性: 10W + 6.25H - 5A - 161', () => {
    // 550 + 1000 - 140 - 161 = 1249
    expect(calculateBMR(female)).toBe(1249)
  })
})

describe('calculateBMR_KatchMcArdle', () => {
  it('按瘦体重计算: 370 + 21.6 × LBM', () => {
    // LBM = 70 × 0.8 = 56 → 370 + 1209.6 = 1579.6
    expect(calculateBMR_KatchMcArdle(70, 20)).toBe(1580)
  })
})

describe('calculateTDEE', () => {
  it('无体脂时用 Mifflin-St Jeor × 活动系数', () => {
    expect(calculateTDEE(male)).toBe(Math.round(1674 * 1.55))
  })

  it('提供体脂时优先 Katch-McArdle', () => {
    const withFat = { ...male, bodyFat: 20 }
    expect(calculateTDEE(withFat)).toBe(Math.round(1580 * 1.55))
  })
})

describe('calculateNutritionTargets', () => {
  it('减脂: TDEE - 500, 蛋白 2.0g/kg, 脂肪 25%', () => {
    const t = calculateNutritionTargets(female)
    const tdee = calculateTDEE(female)
    expect(t.calories).toBe(tdee - 500)
    expect(t.protein).toBe(110) // 55 × 2.0
  })

  it('增肌: TDEE + 400, 蛋白 1.8g/kg, 脂肪 20%', () => {
    const t = calculateNutritionTargets({ ...male, goal: '增肌' })
    expect(t.calories).toBe(calculateTDEE(male) + 400)
    expect(t.protein).toBe(126) // 70 × 1.8
  })

  it('碳水为剩余热量兜底且不为负', () => {
    const t = calculateNutritionTargets(male)
    const proteinCal = t.protein * 4
    const fatCal = t.fat * 9
    expect(t.carbs).toBeGreaterThanOrEqual(0)
    // 宽松一致性：总热量 ≈ 三大营养素热量之和（±5 kcal 舍入余量）
    expect(Math.abs(t.calories - (proteinCal + fatCal + t.carbs * 4))).toBeLessThanOrEqual(5)
  })
})

describe('validateUserMetrics', () => {
  it('合法输入返回空数组', () => {
    expect(validateUserMetrics(male)).toEqual([])
  })

  it('越界输入给出错误信息', () => {
    expect(validateUserMetrics({ weight: -5 }).length).toBeGreaterThan(0)
    expect(validateUserMetrics({ height: 0 }).length).toBeGreaterThan(0)
    expect(validateUserMetrics({ age: 999 }).length).toBeGreaterThan(0)
  })
})

describe('calculateMacroDeficit', () => {
  it('剩余量不为负', () => {
    const deficit = calculateMacroDeficit(
      { calories: 2000, protein: 50, carbs: 200, fat: 60 },
      { protein: 30, carbs: 250, fat: 40 },
    )
    expect(deficit).toEqual({ protein: 20, carbs: 0, fat: 20 })
  })
})
