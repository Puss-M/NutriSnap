'use client'

import { useState, useEffect } from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScenarioPills } from '@/components/scenario-pills'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/lib/supabase'


interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const { todayProtein, todayCarbs, todayFat, caloriesTarget } = useAppStore()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  
  // Manual State
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Calculate deficits (based on new strategy engine)
  const proteinTarget = (caloriesTarget * 0.3) / 4 
  const carbsTarget = (caloriesTarget * 0.5) / 4
  const fatTarget = (caloriesTarget * 0.2) / 9
  
  const macroDeficit = {
    protein: Math.max(0, proteinTarget - todayProtein),
    carbs: Math.max(0, carbsTarget - todayCarbs),
    fat: Math.max(0, fatTarget - todayFat)
  }

  // Load full user profile for context
  useEffect(() => {
    async function loadContext() {
      try {
        const profile = await getUserProfile()
        if (profile) {
          setUserProfile(profile)
        }
      } catch (e) {
        console.error("Profile load error", e)
      } finally {
        setIsProfileLoading(false)
      }
    }
    loadContext()
  }, [])

  // Manual submit handler with streaming support
  const handleManualSubmit = async (e?: React.FormEvent, overridePrompt?: string) => {
    e?.preventDefault()
    const promptText = overridePrompt || input
    if (!promptText.trim() || isLoading) return

    // 1. Add User Message
    const userMessage: Message = { role: 'user', content: promptText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 2. Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: selectedScenario, // Pass selected context
          macroDeficit,
          userProfile: {
            ...userProfile,
            // Ensure goal has a default if missing
            goal: userProfile?.goal || '维持', 
            targets: { protein: Math.round(proteinTarget) }
          }
        })
      })

      if (!response.ok) throw new Error('Network error')
      if (!response.body) throw new Error('No response body')

      // 3. Handle Stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiContent = ''
      
      // Add empty AI message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        aiContent += chunk
        
        // Update last message
        setMessages(prev => {
          const newHistory = [...prev]
          newHistory[newHistory.length - 1] = { role: 'assistant', content: aiContent }
          return newHistory
        })
      }

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，网络出了点小差错，请稍后再试。' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Show skeletal loading state instead of null to feel "faster"
  if (isProfileLoading && !userProfile) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 animate-pulse" />
        <div className="text-zinc-400 text-sm">正在加载营养师配置...</div>
      </div>
    )
  }

  const userGoal = userProfile?.goal || '维持'

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-zinc-900">🧠 AI 营养助手</h1>
              <p className="text-xs text-zinc-500 font-medium">基于 RAG 的智能饮食顾问</p>
            </div>
          </div>
          
          {/* Scenario Pills */}
          <div className="mb-3">
            <h3 className="text-xs font-bold text-zinc-600 mb-2">📍 你在哪里吃？(必选)</h3>
            <ScenarioPills selected={selectedScenario} onSelect={setSelectedScenario} />
          </div>
          
          {/* Macro deficit display */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 shadow-sm">
            <div className="text-xs font-bold text-blue-700 mb-2 flex justify-between">
              <span>📊 当前营养缺口</span>
              <span className="font-normal text-blue-600/80">
                {userGoal}
              </span>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white text-blue-700 shadow-sm border-blue-100">
                💊 蛋白质 {Math.round(macroDeficit.protein)}g
              </Badge>
              <Badge variant="secondary" className="bg-white text-amber-700 shadow-sm border-amber-100">
                🥖 碳水 {Math.round(macroDeficit.carbs)}g
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Questions (Only show when no messages) */}
        {messages.length === 0 && (
          <div className="px-4 py-3 bg-zinc-50 border-b flex-none">
            <h3 className="text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
              💡 智能提问 
            </h3>
            <div className="space-y-2">
              {/* Context-aware Dynamic Prompt */}
              {macroDeficit.protein > 10 && (
                <button
                  onClick={() => handleManualSubmit(undefined, `我在${selectedScenario || '便利店'}，还需要补${Math.round(macroDeficit.protein)}g蛋白质，推荐吃什么？`)}
                  className="w-full text-left px-3 py-3 bg-white hover:bg-blue-50 rounded-xl border border-zinc-100 text-xs text-zinc-700 transition-all active:scale-95 shadow-sm flex items-center gap-2 group"
                >
                  <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg group-hover:bg-blue-200 transition-colors">⚡️</span>
                  <span>
                    在 <b>{selectedScenario || '便利店'}</b> 怎么补 <span className="font-bold text-blue-600">{Math.round(macroDeficit.protein)}g蛋白质</span> ？
                  </span>
                </button>
              )}
              
              <button
                onClick={() => handleManualSubmit(undefined, `请根据我的${userGoal}目标，为我推荐一份科学的${selectedScenario || '外卖'}晚餐搭配。`)}
                className="w-full text-left px-3 py-3 bg-white hover:bg-emerald-50 rounded-xl border border-zinc-100 text-xs text-zinc-700 transition-all active:scale-95 shadow-sm flex items-center gap-2 group"
              >
                <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-200 transition-colors">🍽️</span>
                推荐一份科学的晚餐搭配
              </button>
            </div>
          </div>
        )}

        {/* Messages Information Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Role Label */}
                <span className="text-[10px] text-zinc-400 mb-1 px-1">
                  {message.role === 'user' ? '你' : 'AI 营养师'}
                </span>
                
                {/* Message Bubble */}
                <Card className={`p-4 shadow-sm border-0 ${
                  message.role === 'user' 
                    ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white text-zinc-800 rounded-2xl rounded-tl-sm ring-1 ring-black/5'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex flex-col items-start max-w-[85%]">
                <span className="text-[10px] text-zinc-400 mb-1 px-1">AI 营养师</span>
                <Card className="p-4 bg-white rounded-2xl rounded-tl-sm ring-1 ring-black/5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* New Input Area */}
        <form 
          id="chat-form"
          onSubmit={handleManualSubmit} 
          className="p-4 border-t bg-white sticky bottom-0 z-10 pb-8"
        >
          <div className="relative flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：我刚吃了一个汉堡，还要补多少蛋白？"
              className="flex-1 pl-4 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!(input || '').trim() || isLoading}
              className="absolute right-1.5 top-1.5 h-9 w-9 bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm transition-transform active:scale-95"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
