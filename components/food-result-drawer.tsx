'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useAppStore, RecognizedFood } from '@/lib/store'
import { saveFoodLog, getDeviceId } from '@/lib/supabase'
import { Check } from 'lucide-react'

interface FoodResultDrawerProps {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function FoodResultDrawer({ open, onClose, onSaved }: FoodResultDrawerProps) {
  const { currentFoods, currentImageUrl, currentContext } = useAppStore()
  const [adjustedFoods, setAdjustedFoods] = useState<RecognizedFood[]>(currentFoods)
  const [isSaving, setIsSaving] = useState(false)

  // Update adjusted foods when currentFoods changes
  useState(() => {
    setAdjustedFoods(currentFoods)
  })

  const handleWeightChange = (index: number, newWeight: number) => {
    setAdjustedFoods(prev => {
      const updated = [...prev]
      const food = updated[index]
      const ratio = newWeight / food.weight_g
      
      updated[index] = {
        ...food,
        weight_g: newWeight,
        calories: Math.round(food.calories * ratio),
        protein: parseFloat((food.protein * ratio).toFixed(1)),
        carbs: parseFloat((food.carbs * ratio).toFixed(1)),
        fat: parseFloat((food.fat * ratio).toFixed(1))
      }
      
      return updated
    })
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    
    try {
      const deviceId = getDeviceId()
      
      // Use server-side API to bypass CORS issues
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

  if (!currentFoods.length) return null

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>识别结果</DrawerTitle>
          <DrawerDescription>拖动滑块调整份量，数据会实时更新</DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-8 overflow-y-auto space-y-4">
          {currentImageUrl && (
            <img 
              src={currentImageUrl} 
              alt="Food" 
              className="w-full h-32 object-cover rounded-lg"
            />
          )}
          
          {adjustedFoods.map((food, index) => (
            <Card key={index} className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{food.name}</h3>
                  {food.confidence < 0.7 && (
                    <Badge variant="outline" className="mt-1">
                      置信度: {Math.round(food.confidence * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-500">
                    {food.calories}
                  </div>
                  <div className="text-xs text-muted-foreground">千卡</div>
                </div>
              </div>

              {/* Macro circles */}
              <div className="flex justify-around text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {food.protein}g
                    </span>
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">蛋白质</div>
                </div>
                <div>
                  <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      {food.carbs}g
                    </span>
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">碳水</div>
                </div>
                <div>
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {food.fat}g
                    </span>
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">脂肪</div>
                </div>
              </div>

              {/* Weight slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>份量调整</span>
                  <span className="font-medium">{food.weight_g}g</span>
                </div>
                <Slider
                  value={[food.weight_g]}
                  onValueChange={(value) => handleWeightChange(index, value[0])}
                  min={10}
                  max={food.weight_g * 3}
                  step={10}
                  className="w-full"
                />
              </div>

              {food.tips && (
                <p className="text-sm text-muted-foreground italic">
                  💡 {food.tips}
                </p>
              )}
            </Card>
          ))}

          <Button 
            onClick={handleSaveAll} 
            className="w-full" 
            size="lg"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : (
              <>
                <Check className="mr-2 h-5 w-5" />
                吃进肚里
              </>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
