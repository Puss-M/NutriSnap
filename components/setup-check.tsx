'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { isConfigured } from '@/lib/supabase'

export function SetupCheck({ children }: { children: React.ReactNode }) {
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    setShowSetup(!isConfigured)
  }, [])

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">🚀 欢迎使用 NutriSnap AI!</h1>
            <p className="text-muted-foreground">首次运行需要配置环境变量</p>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📝 设置步骤</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>获取 Supabase 密钥：
                  <ul className="ml-6 mt-1 text-muted-foreground">
                    <li>访问 <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 underline">supabase.com/dashboard</a></li>
                    <li>创建项目 → Settings → API</li>
                    <li>复制 URL 和 anon key</li>
                  </ul>
                </li>
                <li>获取 Silicon Flow API 密钥：
                  <ul className="ml-6 mt-1 text-muted-foreground">
                    <li>访问 <a href="https://siliconflow.cn/" target="_blank" className="text-blue-600 underline">siliconflow.cn</a></li>
                    <li>获取 API 密钥</li>
                  </ul>
                </li>
                <li>编辑项目根目录的 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env.local</code> 文件</li>
                <li>粘贴你的真实密钥替换 placeholder</li>
                <li>重启开发服务器 (Ctrl+C → npm run dev)</li>
              </ol>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-mono text-xs mb-2 text-muted-foreground">.env.local 文件示例:</h4>
              <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SILICON_FLOW_API_KEY=sk-xxxxx`}
              </pre>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => window.location.reload()} 
                size="lg"
                className="mt-4"
              >
                我已配置完成，重新加载
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            详细教程请查看项目中的 <code>ENV_SETUP.md</code> 和 <code>QUICKSTART.md</code>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
