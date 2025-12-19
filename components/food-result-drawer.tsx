'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAppStore, RecognizedFood } from '@/lib/store'
import { getDeviceId } from '@/lib/supabase'
import { Check, Flame, Beef, Wheat, Droplets } from 'lucide-react'

interface FoodResultDrawerProps {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function FoodResultDrawer({ open, onClose, onSaved }: FoodResultDrawerProps) {
  const { currentFoods, currentImageUrl, currentContext } = useAppStore()
  const [adjustedFoods, setAdjustedFoods] = useState<RecognizedFood[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // FIX: Use useEffect to sync adjustedFoods when currentFoods changes
  useEffect(() => {
    if (currentFoods && currentFoods.length > 0) {
      setAdjustedFoods([...currentFoods])
    }
  }, [currentFoods])

  const handleWeightChange = (index: number, newWeight: number) => {
    setAdjustedFoods(prev => {
      const updated = [...prev]
      const food = updated[index]
      const originalFood = currentFoods[index]
      const ratio = newWeight / originalFood.weight_g
      
      updated[index] = {
        ...food,
        weight_g: newWeight,
        calories: Math.round(originalFood.calories * ratio),
        protein: parseFloat((originalFood.protein * ratio).toFixed(1)),
        carbs: parseFloat((originalFood.carbs * ratio).toFixed(1)),
        fat: parseFloat((originalFood.fat * ratio).toFixed(1))
      }
      
      return updated
    })
  }

  const handleSaveAll = async () => {
    if (!adjustedFoods || adjustedFoods.length === 0) {
      alert('没有可保存的食物数据')
      return
    }
    
    setIsSaving(true)
    
    try {
      const deviceId = getDeviceId()
      
      const response = await fetch('/api/save-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          foods: adjustedFoods.map(food => ({
            device_id: deviceId,
            food_name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            weight_g: food.weight_g,
            image_url: currentImageUrl,
            context_tag: currentContext,
            confidence: food.confidence
          }))
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }
      
      console.log('[Save] Success:', data)
      onSaved?.()
      onClose()
    } catch (error: any) {
      console.error('Save error:', error)
      alert('保存失败: ' + (error.message || '请重试'))
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate totals
  const totals = adjustedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  if (!currentFoods || currentFoods.length === 0) return null

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[90vh] bg-white">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-xl">🍽️ 识别结果</DrawerTitle>
          <DrawerDescription>拖动滑块调整份量</DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto space-y-4">
          {/* Food Image */}
          {currentImageUrl && (
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={currentImageUrl} 
                alt="Food" 
                className="w-full h-40 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">
                  识别到 {adjustedFoods.length} 种食物
                </p>
              </div>
            </div>
          )}

          {/* Total Summary Card */}
          <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-emerald-800">本餐总计</span>
              <span className="text-2xl font-bold text-emerald-600">{totals.calories} kcal</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/60 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-pink-600">
                  <Beef size={14} />
                  <span className="font-bold">{totals.protein.toFixed(1)}g</span>
                </div>
                <span className="text-xs text-zinc-500">蛋白质</span>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-amber-600">
                  <Wheat size={14} />
                  <span className="font-bold">{totals.carbs.toFixed(1)}g</span>
                </div>
                <span className="text-xs text-zinc-500">碳水</span>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-orange-600">
                  <Droplets size={14} />
                  <span className="font-bold">{totals.fat.toFixed(1)}g</span>
                </div>
                <span className="text-xs text-zinc-500">脂肪</span>
              </div>
            </div>
          </Card>
          
          {/* Individual Food Cards */}
          {adjustedFoods.map((food, index) => (
            <Card key={index} className="p-4 space-y-3 border-zinc-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base">{food.name}</h3>
                  {food.confidence < 0.7 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      置信度 {Math.round(food.confidence * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame size={16} />
                  <span className="font-bold text-lg">{food.calories}</span>
                  <span className="text-xs text-zinc-400">kcal</span>
                </div>
              </div>

              {/* Macros Row */}
              <div className="flex gap-3 text-sm">
                <span className="text-pink-600">蛋白 {food.protein}g</span>
                <span className="text-amber-600">碳水 {food.carbs}g</span>
                <span className="text-orange-600">脂肪 {food.fat}g</span>
              </div>

              {/* Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>份量调整</span>
                  <span className="font-medium text-zinc-700">{food.weight_g}g</span>
                </div>
                <Slider
                  value={[food.weight_g]}
                  onValueChange={(value) => handleWeightChange(index, value[0])}
                  min={10}
                  max={Math.max(500, food.weight_g * 2)}
                  step={10}
                  className="w-full"
                />
              </div>

              {food.tips && (
                <p className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg">
                  💡 {food.tips}
                </p>
              )}
            </Card>
          ))}

          {/* Save Button */}
          <Button 
            onClick={handleSaveAll} 
            className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl" 
            size="lg"
            disabled={isSaving || adjustedFoods.length === 0}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                保存中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                吃进肚里 🍴
              </span>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
