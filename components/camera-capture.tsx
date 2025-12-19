'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore, shouldShowPaywall } from '@/lib/store'

interface CameraCaptureProps {
  context?: string
  onAnalysisComplete?: () => void
  onPaywallTrigger?: () => void
}

// Fitness tips to show during loading
const FITNESS_TIPS = [
  { emoji: '💪', tip: '每餐摄入25-30g蛋白质，吸收效率最高' },
  { emoji: '🥦', tip: '每天摄入25-30g膳食纤维，保持肠道健康' },
  { emoji: '💧', tip: '高蛋白饮食需要更多水分，目标每天3L' },
  { emoji: '🍗', tip: '鸡胸肉是最经济的蛋白质来源，每100g含27g蛋白' },
  { emoji: '🥚', tip: '一个鸡蛋含7g蛋白质，性价比极高' },
  { emoji: '⏰', tip: '训练后30分钟内补充蛋白质，吸收效果最佳' },
  { emoji: '🌙', tip: '睡前可以喝杯牛奶，缓释蛋白助肌肉恢复' },
  { emoji: '🏋️', tip: '增肌期每公斤体重需要1.6-2.2g蛋白质' },
  { emoji: '🥗', tip: '蔬菜热量低饱腹感强，减脂期多吃不会胖' },
  { emoji: '⚡', tip: '碳水是运动的主要能量来源，训练前要补充' },
]

export function CameraCapture({ context, onAnalysisComplete, onPaywallTrigger }: CameraCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentTip, setCurrentTip] = useState(FITNESS_TIPS[0])
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const setFoodResult = useAppStore(state => state.setFoodResult)
  const incrementUsage = useAppStore(state => state.incrementUsage)

  // Rotate tips during loading
  useEffect(() => {
    if (!isAnalyzing) return
    
    const interval = setInterval(() => {
      setCurrentTip(FITNESS_TIPS[Math.floor(Math.random() * FITNESS_TIPS.length)])
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isAnalyzing])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAnalysisError(null)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    if (shouldShowPaywall()) {
      onPaywallTrigger?.()
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setCurrentTip(FITNESS_TIPS[Math.floor(Math.random() * FITNESS_TIPS.length)])
    incrementUsage()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25s timeout

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          context
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`服务器错误 (${response.status})`)
      }

      const data = await response.json()
      
      if (!data.foods || data.foods.length === 0) {
        throw new Error('未能识别出食物，请重新拍摄')
      }

      setFoodResult(data.foods, selectedImage, context || null)
      onAnalysisComplete?.()
      
    } catch (error: any) {
      console.error('Analysis error:', error)
      if (error.name === 'AbortError') {
        setAnalysisError('识别超时，请检查网络后重试')
      } else {
        setAnalysisError(error.message || '识别失败，请重试')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedImage ? (
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="h-32 text-lg bg-emerald-600 hover:bg-emerald-700"
          >
            <Camera className="mr-2 h-6 w-6" />
            拍摄食物照片
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture')
                fileInputRef.current.click()
              }
            }}
            className="h-16"
          >
            <Upload className="mr-2 h-5 w-5" />
            从相册选择
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden shadow-lg border-0">
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Selected food" 
              className="w-full h-64 object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center px-6">
                  <div className="flex justify-center gap-1 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <p className="text-lg font-medium mb-2">AI 正在分析...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 space-y-3">
            {/* Fitness Tip Card - shown during loading */}
            {isAnalyzing && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{currentTip.emoji}</span>
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">💡 健身小知识</p>
                    <p className="text-sm text-blue-800">{currentTip.tip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {analysisError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-medium mb-2">❌ {analysisError}</p>
                <Button 
                  onClick={analyzeImage} 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {!isAnalyzing && !analysisError && (
              <>
                <Button 
                  onClick={analyzeImage} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base" 
                  size="lg"
                >
                  🔍 开始识别
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedImage(null)
                    setAnalysisError(null)
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  📷 重新拍摄
                </Button>
              </>
            )}

            {/* Cancel button during loading */}
            {isAnalyzing && (
              <Button 
                onClick={() => setIsAnalyzing(false)} 
                variant="ghost" 
                className="w-full text-zinc-500"
              >
                取消
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
