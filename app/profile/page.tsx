'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  calculateBMI,
  getBMICategory,
  getBMIColor,
  calculateNutritionTargets,
  validateUserMetrics,
  type UserMetrics
} from '@/lib/calculators'
import { APP_CONFIG, type ActivityLevel as ActivityLevelType, type Goal as GoalType } from '@/lib/config'
import { getUserProfile, supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [metrics, setMetrics] = useState<UserMetrics>({
    weight: 55,
    height: 164,
    age: 20,
    gender: '女',
    activityLevel: '中度活动 (每周3-5次)',
    goal: '维持',
    bodyFat: undefined // Optional
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Load profile from database
  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile()
      if (profile && profile.weight) {
        setMetrics({
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          gender: profile.gender as '男' | '女',
          activityLevel: profile.activity_level as ActivityLevelType,
          goal: profile.goal as GoalType,
          bodyFat: profile.body_fat ?? undefined
        })
      }
    }
    loadProfile()
  }, [])

  const bmi = calculateBMI(metrics.weight, metrics.height)
  const targets = calculateNutritionTargets(metrics)
  const bmiColor = getBMIColor(bmi)

  const handleSave = async () => {
    // Validate input
    const validationErrors = validateUserMetrics(metrics)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors([])

    try {
      const profile = await getUserProfile()
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            weight: metrics.weight,
            height: metrics.height,
            age: metrics.age,
            gender: metrics.gender,
            activity_level: metrics.activityLevel,
            goal: metrics.goal,
            body_fat: metrics.bodyFat ?? null,
            daily_calories_target: targets.calories,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
        
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Save error:', error)
      setErrors(['保存失败，请重试'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">个人资料</h1>
          <p className="text-sm text-zinc-500">设置身体数据，获取个性化营养目标</p>
        </div>
      </div>

      {/* BMI Card */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white">
        <h3 className="font-bold mb-4 text-zinc-800">BMI 指数</h3>
        <div className="text-center">
          <div className={`text-6xl font-black ${bmiColor}`}>{bmi}</div>
          <div className="text-sm text-zinc-500 mt-2 font-medium">{getBMICategory(bmi)}</div>
        </div>
      </Card>

      {/* Body Metrics Input */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 text-zinc-800">身体数据</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium">体重 (kg)</label>
              <Input
                type="number"
                value={metrics.weight}
                onChange={(e) => setMetrics({ ...metrics, weight: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-medium">身高 (cm)</label>
              <Input
                type="number"
                value={metrics.height}
                onChange={(e) => setMetrics({ ...metrics, height: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium">年龄</label>
              <Input
                type="number"
                value={metrics.age}
                onChange={(e) => setMetrics({ ...metrics, age: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-medium">性别</label>
              <select
                value={metrics.gender}
                onChange={(e) => setMetrics({ ...metrics, gender: e.target.value as '男' | '女' })}
                className="mt-1 w-full px-3 py-2 border-2 border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="女">女</option>
                <option value="男">男</option>
              </select>
            </div>
          </div>

          {/* Body Fat Input (Optional) */}
          <div>
            <label className="text-xs text-zinc-500 font-medium">体脂率 % (选填，填写后使用更精准的 Katch-McArdle 公式)</label>
            <Input
              type="number"
              placeholder="例如: 15"
              value={metrics.bodyFat ?? ''}
              onChange={(e) => setMetrics({ 
                ...metrics, 
                bodyFat: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium">活动水平</label>
            <select
              value={metrics.activityLevel}
              onChange={(e) => setMetrics({ ...metrics, activityLevel: e.target.value as ActivityLevelType })}
              className="mt-1 w-full px-3 py-2 border-2 border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.keys(APP_CONFIG.ACTIVITY_FACTORS).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium">健身目标</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.keys(APP_CONFIG.MACRO_CONFIGS).map(goal => (
                <button
                  key={goal}
                  onClick={() => setMetrics({ ...metrics, goal: goal as GoalType })}
                  className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                    metrics.goal === goal
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          {errors.map((err, idx) => (
            <p key={idx} className="text-sm text-red-600">{err}</p>
          ))}
        </div>
      )}

      {/* Nutrition Targets */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 text-zinc-800">每日营养目标</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl">
            <div className="text-xs text-emerald-700 font-medium">总热量</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{targets.calories}</div>
            <div className="text-xs text-emerald-600">kcal</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="text-xs text-blue-700 font-medium">蛋白质</div>
            <div className="text-3xl font-black text-blue-600 mt-1">{targets.protein}</div>
            <div className="text-xs text-blue-600">g</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl">
            <div className="text-xs text-amber-700 font-medium">碳水化合物</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{targets.carbs}</div>
            <div className="text-xs text-amber-600">g</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-xl">
            <div className="text-xs text-pink-700 font-medium">脂肪</div>
            <div className="text-3xl font-black text-pink-600 mt-1">{targets.fat}</div>
            <div className="text-xs text-pink-600">g</div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full h-14 text-lg bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-bold"
      >
        {loading ? '保存中...' : saved ? '✓ 已保存' : '保存设置'}
      </Button>
    </div>
  )
}
