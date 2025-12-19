'use client'

import { useState, useRef } from 'react'
import { Camera, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore, shouldShowPaywall } from '@/lib/store'

interface CameraCaptureProps {
  context?: string
  onAnalysisComplete?: () => void
  onPaywallTrigger?: () => void
}

const FUN_LOADING_MESSAGES = [
  "正在分析这块红烧肉的油水...",
  "正在计算这碗米饭的碳水炸弹...",
  "让我看看这是不是热量陷阱...",
  "营养师AI正在给你算账...",
  "正在识别脂肪含量...",
  "正在估算食堂大妈的勺法...",
]

export function CameraCapture({ context, onAnalysisComplete, onPaywallTrigger }: CameraCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const setFoodResult = useAppStore(state => state.setFoodResult)
  const incrementUsage = useAppStore(state => state.incrementUsage)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Display preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    // Check paywall before analysis
    if (shouldShowPaywall()) {
      onPaywallTrigger?.()
      return
    }

    setIsAnalyzing(true)
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)])
    incrementUsage()

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          context
        })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setFoodResult(data.foods, selectedImage, context || null)
      onAnalysisComplete?.()
    } catch (error) {
      console.error('Analysis error:', error)
      alert('识别失败，请重试')
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
            className="h-32 text-lg"
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
        <Card className="overflow-hidden shadow-sm">
          <img 
            src={selectedImage} 
            alt="Selected food" 
            className="w-full h-64 object-cover"
          />
          <div className="p-4 space-y-3">
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="ml-2">{loadingMessage}</span>
              </div>
            ) : (
              <>
                <Button onClick={analyzeImage} className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                  开始识别
                </Button>
                <Button 
                  onClick={() => setSelectedImage(null)} 
                  variant="outline" 
                  className="w-full"
                >
                  重新拍摄
                </Button>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
