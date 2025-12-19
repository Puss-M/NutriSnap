import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Check if using placeholder values
export const isConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  !supabaseAnonKey.includes('placeholder')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Database types
export interface Profile {
  id: string
  device_id: string
  is_vip: boolean
  vip_expiry: string | null
  daily_calories_target: number
  
  // User body metrics
  weight: number           // kg
  height: number           // cm
  age: number
  gender: string           // '男' or '女'
  activity_level: string
  goal: string             // '增肌', '减脂', '维持'
  
  created_at: string
  updated_at: string
}

export interface FoodLog {
  id: string
  user_id: string | null
  device_id: string
  image_url: string | null
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  weight_g: number | null
  context_tag: string | null
  confidence: number
  created_at: string
}

// Helper to get or create device ID
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let deviceId = localStorage.getItem('nutrisnap_device_id')
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('nutrisnap_device_id', deviceId)
  }
  return deviceId
}

// Get or create user profile
export async function getUserProfile(): Promise<Profile | null> {
  const deviceId = getDeviceId()
  
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', deviceId)
    .single()
  
  if (existing) return existing
  
  // Create new profile
  const { data: newProfile } = await supabase
    .from('profiles')
    .insert({ device_id: deviceId })
    .select()
    .single()
  
  return newProfile
}

// Save food log
export async function saveFoodLog(log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('logs')
    .insert(log)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get today's logs
export async function getTodayLogs(): Promise<FoodLog[]> {
  const deviceId = getDeviceId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data } = await supabase
    .from('logs')
    .select('*')
    .eq('device_id', deviceId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
  
  return data || []
}

// Upload image to storage
export async function uploadFoodImage(file: File): Promise<string | null> {
  const deviceId = getDeviceId()
  const fileName = `${deviceId}/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('food-images')
    .upload(fileName, file)
  
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('food-images')
    .getPublicUrl(data.path)
  
  return publicUrl
}
