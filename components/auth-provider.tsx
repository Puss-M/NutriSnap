'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { getUser, onAuthStateChange, signOut as authSignOut } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial user
    getUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
      
      if (!user && !isPublicRoute) {
        router.push('/login')
      }
    }
  }, [user, loading, pathname, router])

  const handleSignOut = async () => {
    await authSignOut()
    setUser(null)
    router.push('/login')
  }

  // Show nothing while checking auth to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-zinc-400">加载中...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

