// Health & Nutrition Calculators
// 基于科学公式计算 BMI, BMR, TDEE 和营养目标

import { APP_CONFIG, ActivityLevel, Goal, Gender } from './config'

/**
 * User body metrics
 */
export interface UserMetrics {
  weight: number      // kg
  height: number      // cm
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  goal: Goal
}

/**
 * Daily nutrition targets
 */
export interface NutritionTargets {
  calories: number
  protein: number    // grams
  carbs: number      // grams
  fat: number        // grams
}

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight(kg) / height(m)²
 */
export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100
  return Math.round((weight / (heightM ** 2)) * 10) / 10
}

/**
 * Get BMI category in Chinese
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏胖'
  return '肥胖'
}

/**
 * Get BMI category color for UI
 */
export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return 'text-blue-500'
  if (bmi < 24) return 'text-emerald-500'
  if (bmi < 28) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * 最准确的基础代谢率计算公式
 * 
 * Male: BMR = 10W + 6.25H - 5A + 5
 * Female: BMR = 10W + 6.25H - 5A - 161
 */
export function calculateBMR(metrics: UserMetrics): number {
  const { weight, height, age, gender } = metrics
  
  let bmr = 10 * weight + 6.25 * height - 5 * age
  
  if (gender === '男') {
    bmr += 5
  } else {
    bmr -= 161
  }
  
  return Math.round(bmr)
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Factor
 */
export function calculateTDEE(metrics: UserMetrics): number {
  const bmr = calculateBMR(metrics)
  const activityFactor = APP_CONFIG.ACTIVITY_FACTORS[metrics.activityLevel]
  return Math.round(bmr * activityFactor)
}

/**
 * Calculate personalized nutrition targets based on goal
 */
/**
 * Calculate personalized nutrition targets based on goal
 * 策略模块 (The Strategist) Implementation
 */
export function calculateNutritionTargets(metrics: UserMetrics): NutritionTargets {
  const tdee = calculateTDEE(metrics)
  
  let targetCalories = tdee
  let proteinPerKg = 1.0
  let fatRatio = 0.25
  
  // Strategy: Fat Loss (减脂)
  if (metrics.goal === '减脂') {
    // TDEE - 500 kcal
    targetCalories = tdee - 500
    // Protein: 1.8g - 2.2g / kg (Use 2.0g as standard)
    proteinPerKg = 2.0
    // Fat: 25-30% (Use 25%)
    fatRatio = 0.25
  } 
  // Strategy: Muscle Gain (增肌)
  else if (metrics.goal === '增肌') {
    // TDEE + 300~500 kcal (Use +400)
    targetCalories = tdee + 400
    // Protein: 1.6g - 2.0g / kg (Use 1.8g)
    proteinPerKg = 1.8
    // Fat: 20-25% (Use 20% to keep it clean)
    fatRatio = 0.20
  }
  // Strategy: Maintenance (维持)
  else {
    proteinPerKg = 1.2
    fatRatio = 0.25
  }
  
  // 1. Calculate Protein (Priority #1)
  const protein = Math.round(metrics.weight * proteinPerKg)
  const proteinCalories = protein * 4
  
  // 2. Calculate Fat (Priority #2)
  const fatCalories = targetCalories * fatRatio
  const fat = Math.round(fatCalories / 9)
  
  // 3. Calculate Carbs (Remainder)
  const remainingCalories = targetCalories - proteinCalories - fatCalories
  const carbs = Math.max(0, Math.round(remainingCalories / 4))
  
  return {
    calories: Math.round(targetCalories),
    protein,
    carbs,
    fat
  }
}

/**
 * Validate user input metrics
 * @returns Array of error messages (empty if valid)
 */
export function validateUserMetrics(metrics: Partial<UserMetrics>): string[] {
  const errors: string[] = []
  const { VALIDATION } = APP_CONFIG
  
  if (metrics.weight !== undefined) {
    if (metrics.weight < VALIDATION.weight.min || metrics.weight > VALIDATION.weight.max) {
      errors.push(`体重应在 ${VALIDATION.weight.min}-${VALIDATION.weight.max}${VALIDATION.weight.unit} 之间`)
    }
  }
  
  if (metrics.height !== undefined) {
    if (metrics.height < VALIDATION.height.min || metrics.height > VALIDATION.height.max) {
      errors.push(`身高应在 ${VALIDATION.height.min}-${VALIDATION.height.max}${VALIDATION.height.unit} 之间`)
    }
  }
  
  if (metrics.age !== undefined) {
    if (metrics.age < VALIDATION.age.min || metrics.age > VALIDATION.age.max) {
      errors.push(`年龄应在 ${VALIDATION.age.min}-${VALIDATION.age.max}${VALIDATION.age.unit} 之间`)
    }
  }
  
  return errors
}

/**
 * Calculate macro deficit (remaining for the day)
 */
export function calculateMacroDeficit(
  targets: NutritionTargets,
  consumed: { protein: number; carbs: number; fat: number }
): { protein: number; carbs: number; fat: number } {
  return {
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs: Math.max(0, targets.carbs - consumed.carbs),
    fat: Math.max(0, targets.fat - consumed.fat)
  }
}
