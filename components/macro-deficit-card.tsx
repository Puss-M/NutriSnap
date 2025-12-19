'use client'

import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { ArrowDown } from 'lucide-react'

export function MacroDeficitCard() {
  const { todayProtein, todayCarbs, todayFat } = useAppStore()
  
  // TODO: Get targets from profile in future
  // For now, use reasonable defaults based on 2000 kcal
  const proteinTarget = 120  // g
  const carbsTarget = 250    // g  
  const fatTarget = 55       // g
  
  const deficits = {
    protein: Math.max(0, proteinTarget - todayProtein),
    carbs: Math.max(0, carbsTarget - todayCarbs),
    fat: Math.max(0, fatTarget - todayFat)
  }
  
  const macros = [
    { 
      name: '蛋白质', 
      emoji: '💊',
      consumed: todayProtein,
      target: proteinTarget,
      deficit: deficits.protein, 
      color: 'bg-blue-500', 
      lightBg: 'bg-blue-50', 
      textColor: 'text-blue-600',
      deficitColor: 'text-red-500'
    },
    { 
      name: '碳水', 
      emoji: '🥖',
      consumed: todayCarbs,
      target: carbsTarget,
      deficit: deficits.carbs, 
      color: 'bg-amber-500', 
      lightBg: 'bg-amber-50', 
      textColor: 'text-amber-600',
      deficitColor: 'text-red-500'
    },
    { 
      name: '脂肪', 
      emoji: '🧈',
      consumed: todayFat,
      target: fatTarget,
      deficit: deficits.fat, 
      color: 'bg-pink-500', 
      lightBg: 'bg-pink-50', 
      textColor: 'text-pink-600',
      deficitColor: 'text-red-500'
    }
  ]
  
  return (
    <Card className="p-4">
      <h3 className="text-sm font-bold text-zinc-700 mb-3">📊 今日营养摄入</h3>
      <div className="space-y-3">
        {macros.map((macro) => (
          <div key={macro.name} className={`${macro.lightBg} rounded-xl p-3`}>
            {/* Header: emoji + name */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{macro.emoji}</span>
                <span className="font-bold text-zinc-700 text-sm">{macro.name}</span>
              </div>
              {/* Fraction format: consumed/target */}
              <div className="text-sm font-bold text-zinc-600">
                {Math.round(macro.consumed)}/{macro.target}g
              </div>
            </div>
            
            {/* Deficit with red arrow (if any) */}
            {macro.deficit > 0 && (
              <div className={`flex items-center gap-1.5 ${macro.deficitColor} text-sm font-bold`}>
                <ArrowDown size={16} strokeWidth={2.5} />
                <span>还需 {Math.round(macro.deficit)}g</span>
              </div>
            )}
            
            {/* Completed indicator */}
            {macro.deficit === 0 && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                <span>✓ 已完成目标</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
