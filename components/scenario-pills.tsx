'use client'

import { Badge } from '@/components/ui/badge'
import { Store, School, ShoppingBag } from 'lucide-react'

export const SCENARIOS = [
  { id: 'convenience_store', label: '便利店', icon: Store, emoji: '🏪' },
  { id: 'canteen', label: '食堂', icon: School, emoji: '🏫' },
  { id: 'takeout', label: '外卖', icon: ShoppingBag, emoji: '🥡' }
]

interface ScenarioPillsProps {
  selected?: string
  onSelect: (scenarioId: string) => void
}

export function ScenarioPills({ selected, onSelect }: ScenarioPillsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {SCENARIOS.map(scenario => (
        <button
          key={scenario.id}
          onClick={() => onSelect(scenario.id)}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-3 transition-all active:scale-95 ${
            selected === scenario.id
              ? 'bg-emerald-500 border-2 border-emerald-500 shadow-md shadow-emerald-200 text-white'
              : 'bg-white border-2 border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-zinc-600'
          }`}
        >
          <span className="text-2xl">{scenario.emoji}</span>
          <span className={`text-xs font-bold ${selected === scenario.id ? 'text-white' : 'text-zinc-600'}`}>
            {scenario.label}
          </span>
        </button>
      ))}
    </div>
  )
}
