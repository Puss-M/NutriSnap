'use client'

import { useState } from 'react'
import { Camera, Bot, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { ScenarioPills } from '@/components/scenario-pills'
import { CameraCapture } from '@/components/camera-capture'
import { FoodResultDrawer } from '@/components/food-result-drawer'
import { PaywallDialog } from '@/components/paywall-dialog'
import { MacroDeficitCard } from '@/components/macro-deficit-card'
import { getTodayLogs } from '@/lib/supabase'
import Link from 'next/link'

export default function HomePage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [showCamera, setShowCamera] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  
  const { todayCalories, caloriesTarget, updateTodayTotals } = useAppStore()
  const remaining = caloriesTarget - todayCalories
  const progress = Math.min(100, (todayCalories / caloriesTarget) * 100)

  const refreshTotals = async () => {
    console.log('[HomePage] refreshTotals called')
    const logs = await getTodayLogs()
    console.log('[HomePage] Got logs:', logs.length, logs)
    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
    console.log('[HomePage] Updating totals:', totals)
    updateTodayTotals(totals.calories, totals.protein, totals.carbs, totals.fat)
  }

  return (
    <>
      <div className="px-6 py-8 space-y-8">
        {/* Header - Premium Style */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥑</span>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">NutriSnap</h1>
          </div>
          <Link href="/profile">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer">
              <span className="text-emerald-700 font-bold">我</span>
            </div>
          </Link>
        </header>

        {/* Core Dashboard Card - With Decorative Glows */}
        <section className="relative z-10">
          <div className="bg-white rounded-[2rem] p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden">
            {/* Decorative background glows */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-teal-100/40 rounded-full blur-3xl -z-10"></div>

            <h2 className="text-zinc-500 font-medium mb-1 tracking-wide uppercase text-xs">今日剩余热量</h2>
            {/* Ultra-large number emphasis */}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black text-zinc-900 tracking-tighter leading-none">
                {remaining > 0 ? remaining : 0}
              </span>
              <span className="text-xl text-zinc-400 font-medium">kcal</span>
            </div>

            {/* Enhanced progress bar with gradient */}
            <div className="mt-8 h-4 bg-zinc-100 rounded-full overflow-hidden p-1">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-sm relative transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Progress glow dot */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/80 rounded-full mr-1"></div>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium text-zinc-400 px-1">
              <span>已摄入 {todayCalories}</span>
              <span>目标 {caloriesTarget}</span>
            </div>
          </div>
        </section>

        {/* Macro Deficit Card - Enhanced */}
        <MacroDeficitCard />


      </div>

      {/* Camera Capture */}
      {showCamera && (
        <CameraCapture 
          context={selectedScenario}
          onAnalysisComplete={() => setShowResults(true)}
          onPaywallTrigger={() => setShowPaywall(true)}
        />
      )}

      {/* Result Drawer */}
      <FoodResultDrawer
        open={showResults}
        onClose={() => {
          setShowResults(false)
          setShowCamera(false)
        }}
        onSaved={refreshTotals}
      />

      {/* Paywall Dialog */}
      <PaywallDialog 
        open={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />

      {/* Modern Bottom Navigation - Premium FAB Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 pb-safe pt-3 px-8 flex justify-around items-center z-50 max-w-md mx-auto">
        <Link href="/chat">
          <button className="flex flex-col items-center text-zinc-400 hover:text-emerald-600 transition-colors">
            <Bot size={24} strokeWidth={2.5} />
          </button>
        </Link>

        {/* Core Floating Action Button (FAB) - Enhanced */}
        <div className="relative -top-8 group">
          <button 
            onClick={() => setShowCamera(true)}
            className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-white p-5 rounded-[1.2rem] shadow-xl shadow-emerald-200/50 border-[4px] border-white transition-all active:scale-90 group-hover:shadow-2xl group-hover:shadow-emerald-300/50 group-hover:-translate-y-1"
          >
            <Camera size={30} strokeWidth={2} />
          </button>
        </div>

        <Link href="/stats">
          <button className="flex flex-col items-center text-zinc-400 hover:text-emerald-600 transition-colors">
            <FileText size={24} strokeWidth={2.5} />
          </button>
        </Link>
      </nav>
    </>
  )
}
