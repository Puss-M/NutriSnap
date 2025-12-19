'use client'

import { useEffect } from 'react'
import { getTodayLogs, getUserProfile } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { calculateNutritionTargets, type UserMetrics } from '@/lib/calculators'
import type { ActivityLevel, Goal } from '@/lib/config'

export function DataLoader({ children }: { children: React.ReactNode }) {
  const { updateTodayTotals, setCaloriesTarget, setMacroTargets, setVIP } = useAppStore()

  useEffect(() => {
    async function loadData() {
      // Load user profile
      const profile = await getUserProfile()
      if (profile) {
        setVIP(profile.is_vip)
        
        // Calculate personalized nutrition targets if profile has body data
        if (profile.weight && profile.height && profile.age) {
          const userMetrics: UserMetrics = {
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender as '男' | '女',
            activityLevel: profile.activity_level as ActivityLevel,
            goal: profile.goal as Goal,
            bodyFat: profile.body_fat
          }
          
          const targets = calculateNutritionTargets(userMetrics)
          console.log('[DataLoader] Calculated personalized targets:', targets)
          
          // Validate targets - fallback to defaults if NaN
          if (targets.calories && !isNaN(targets.calories)) {
            setCaloriesTarget(targets.calories)
            setMacroTargets(
              isNaN(targets.protein) ? 99 : targets.protein, 
              isNaN(targets.carbs) ? 390 : targets.carbs, 
              isNaN(targets.fat) ? 54 : targets.fat
            )
          } else {
            console.warn('[DataLoader] Invalid targets, using defaults')
            setCaloriesTarget(profile.daily_calories_target || 2000)
            setMacroTargets(66, 316, 57)
          }
        } else {
          // Fallback to default if no profile data
          setCaloriesTarget(profile.daily_calories_target || 2000)
          // Set default macro targets for 2000 kcal maintenance
          setMacroTargets(66, 316, 57)
        }
      }

      // Load today's logs
      const logs = await getTodayLogs()
      const totals = logs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
      
      updateTodayTotals(totals.calories, totals.protein, totals.carbs, totals.fat)
    }

    loadData()
  }, [updateTodayTotals, setCaloriesTarget, setVIP])

  return <>{children}</>
}
