'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Coffee } from 'lucide-react'

interface PaywallDialogProps {
  open: boolean
  onClose: () => void
}

export function PaywallDialog({ open, onClose }: PaywallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Coffee className="h-6 w-6 text-emerald-600" />
            今日免费次数已用完
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            每天可免费使用 3 次 AI 识图功能
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600">¥6.66</div>
                <div className="text-sm text-muted-foreground mt-1">/月</div>
              </div>
              
              <div className="text-sm text-center text-muted-foreground">
                解锁后可享受
              </div>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  无限次 AI 识图
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  专属场景推荐
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  数据导出功能
                </li>
              </ul>
            </div>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-center">
              💡 <strong>如何开通？</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              请添加微信：<span className="font-mono font-semibold">nutrisnap</span>
              <br />
              备注"开通会员"获取激活码
            </p>
          </div>

          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
          >
            我知道了
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
