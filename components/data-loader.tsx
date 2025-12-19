'use client'

import { useEffect } from 'react'
import { getTodayLogs, getUserProfile } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { calculateNutritionTargets, type UserMetrics } from '@/lib/calculators'
import type { ActivityLevel, Goal } from '@/lib/config'

export function DataLoader({ children }: { children: React.ReactNode }) {
  const { updateTodayTotals, setCaloriesTarget, setVIP } = useAppStore()

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
            goal: profile.goal as Goal
          }
          
          const targets = calculateNutritionTargets(userMetrics)
          console.log('[DataLoader] Calculated personalized targets:', targets)
          setCaloriesTarget(targets.calories)
          
          // TODO: Add protein/carbs/fat targets to store in future
          // For now, they're available via profile
        } else {
          // Fallback to default if no profile data
          setCaloriesTarget(profile.daily_calories_target || 2000)
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
