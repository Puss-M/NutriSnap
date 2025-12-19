'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signUp, linkProfileToUser } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Sparkles, Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }

    setLoading(true)

    try {
      const data = await signUp(email, password)
      
      // If auto-confirmed (no email verification), link profile
      if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true)
        // Show success message for email confirmation
      } else if (data.user) {
        await linkProfileToUser(data.user.id, data.user.email || '')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center shadow-xl border-0">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">注册成功！</h2>
          <p className="text-zinc-500 mb-6">
            我们已发送确认邮件到 <span className="font-medium text-zinc-700">{email}</span>，
            请点击邮件中的链接完成验证。
          </p>
          <Link href="/login">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
              返回登录
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">创建账号</h1>
          <p className="text-zinc-500 mt-1">开始您的智能营养之旅</p>
        </div>

        {/* Signup Card */}
        <Card className="p-6 shadow-xl border-0">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-zinc-600 mb-1 block">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-zinc-600 mb-1 block">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="至少 6 位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-zinc-600 mb-1 block">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
            >
              {loading ? '注册中...' : (
                <>
                  创建账号
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-zinc-400">已有账号？</span>
            </div>
          </div>

          {/* Login Link */}
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-zinc-200 hover:border-emerald-500 hover:text-emerald-600 font-bold rounded-xl"
            >
              返回登录
            </Button>
          </Link>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-zinc-400 mt-4">
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
