import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Check if using placeholder values
export const isConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  !supabaseAnonKey.includes('placeholder')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// ============ AUTH FUNCTIONS ============

// Sign up with email and password
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current user
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}


// ============ DATABASE TYPES ============

export interface Profile {
  id: string
  user_id?: string            // NEW: Link to auth.users
  device_id: string
  email?: string              // NEW: User email for display
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
  body_fat?: number        // Optional body fat percentage
  
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


// ============ DEVICE ID (Fallback for non-logged-in users) ============

export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let deviceId = localStorage.getItem('nutrisnap_device_id')
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('nutrisnap_device_id', deviceId)
  }
  return deviceId
}


// ============ PROFILE FUNCTIONS ============

// Get or create user profile (supports both auth users and anonymous device users)
export async function getUserProfile(): Promise<Profile | null> {
  const deviceId = getDeviceId()
  
  // First, check if user is logged in
  const user = await getUser()
  
  if (user) {
    // Logged-in user: first try to fetch by user_id
    const { data: existingByUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (existingByUser) return existingByUser
    
    // Fallback: check if there's a profile by device_id (from before login)
    const { data: existingByDevice, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle()
    
    console.log('[getUserProfile] existingByDevice:', existingByDevice, 'error:', error)
    
    if (existingByDevice) {
      // Link this profile to the authenticated user
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ user_id: user.id, email: user.email })
        .eq('id', existingByDevice.id)
        .select()
        .maybeSingle()
      
      console.log('[getUserProfile] Linked profile to user:', updated, updateError)
      return updated || existingByDevice
    }
    
    // Create new profile for authenticated user
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ 
        user_id: user.id,
        device_id: deviceId,
        email: user.email
      })
      .select()
      .maybeSingle()
    
    return newProfile
  } else {
    // Anonymous user: use device_id
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle()  // Use maybeSingle to avoid error if not found
    
    if (existing) return existing
    
    // Create new anonymous profile
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ device_id: deviceId })
      .select()
      .single()
    
    return newProfile
  }
}

// Link anonymous profile to authenticated user (call after login)
export async function linkProfileToUser(userId: string, email: string): Promise<void> {
  const deviceId = getDeviceId()
  
  // Check if there's an existing anonymous profile
  const { data: anonProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', deviceId)
    .is('user_id', null)
    .maybeSingle()
  
  if (anonProfile) {
    // Link the anonymous profile to this user
    await supabase
      .from('profiles')
      .update({ user_id: userId, email })
      .eq('id', anonProfile.id)
  }
}


// ============ FOOD LOG FUNCTIONS ============

export async function saveFoodLog(log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'>) {
  const user = await getUser()
  
  const { data, error } = await supabase
    .from('logs')
    .insert({
      ...log,
      user_id: user?.id || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTodayLogs(): Promise<FoodLog[]> {
  const user = await getUser()
  const deviceId = getDeviceId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let query = supabase
    .from('logs')
    .select('*')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
  
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.eq('device_id', deviceId)
  }
  
  const { data } = await query
  return data || []
}


// ============ STORAGE FUNCTIONS ============

export async function uploadFoodImage(file: File): Promise<string | null> {
  const user = await getUser()
  const folder = user?.id || getDeviceId()
  const fileName = `${folder}/${Date.now()}_${file.name}`
  
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

