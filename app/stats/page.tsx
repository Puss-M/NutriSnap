'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { getTodayLogs, FoodLog } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function StatsPage() {
  const { todayCalories, todayProtein, todayCarbs, todayFat, caloriesTarget } = useAppStore()
  const [logs, setLogs] = useState<FoodLog[]>([])

  useEffect(() => {
    getTodayLogs().then(setLogs)
  }, [])

  const progress = Math.min(100, (todayCalories / caloriesTarget) * 100)

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">今日统计</h1>
            <p className="text-sm text-zinc-500">查看饮食数据</p>
          </div>
        </div>

        {/* Calorie ring progress */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${progress * 2.51} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{todayCalories}</div>
                <div className="text-xs text-muted-foreground">/ {caloriesTarget} kcal</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">今日摄入</div>
                <div className="text-2xl font-bold text-emerald-500">{Math.round(progress)}%</div>
            </div>
          </div>
        </Card>

        {/* Macros breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">营养素</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">蛋白质</span>
              <span className="font-semibold text-blue-600">{todayProtein.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">碳水化合物</span>
              <span className="font-semibold text-yellow-600">{todayCarbs.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">脂肪</span>
              <span className="font-semibold text-red-600">{todayFat.toFixed(1)}g</span>
            </div>
          </div>
        </Card>

        {/* Today's food log */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">今日饮食记录</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              还没有记录哦，快去拍照吧！
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{log.food_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.weight_g}g · P:{log.protein}g C:{log.carbs}g F:{log.fat}g
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-500">{log.calories}</div>
                    <div className="text-xs text-muted-foreground">千卡</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
