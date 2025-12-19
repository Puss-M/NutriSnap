import { create } from 'zustand'

export interface RecognizedFood {
  name: string
  weight_g: number
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
  tips: string
}

interface AppState {
  // Usage tracking for paywall
  dailyUsageCount: number
  lastUsageDate: string
  isVIP: boolean
  
  // Current food recognition result
  currentFoods: RecognizedFood[]
  currentImageUrl: string | null
  currentContext: string | null
  
  // Today's totals
  todayCalories: number
  todayProtein: number
  todayCarbs: number
  todayFat: number
  caloriesTarget: number
  
  // Actions
  incrementUsage: () => void
  setVIP: (status: boolean) => void
  setFoodResult: (foods: RecognizedFood[], imageUrl: string | null, context: string | null) => void
  clearFoodResult: () => void
  updateTodayTotals: (calories: number, protein: number, carbs: number, fat: number) => void
  setCaloriesTarget: (target: number) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  dailyUsageCount: 0,
  lastUsageDate: new Date().toDateString(),
  isVIP: false,
  
  currentFoods: [],
  currentImageUrl: null,
  currentContext: null,
  
  todayCalories: 0,
  todayProtein: 0,
  todayCarbs: 0,
  todayFat: 0,
  caloriesTarget: 2000,
  
  // Actions
  incrementUsage: () => {
    const today = new Date().toDateString()
    const state = get()
    
    // Reset count if new day
    if (state.lastUsageDate !== today) {
      set({ dailyUsageCount: 1, lastUsageDate: today })
    } else {
      set({ dailyUsageCount: state.dailyUsageCount + 1 })
    }
  },
  
  setVIP: (status: boolean) => set({ isVIP: status }),
  
  setFoodResult: (foods, imageUrl, context) => set({
    currentFoods: foods,
    currentImageUrl: imageUrl,
    currentContext: context
  }),
  
  clearFoodResult: () => set({
    currentFoods: [],
    currentImageUrl: null,
    currentContext: null
  }),
  
  updateTodayTotals: (calories, protein, carbs, fat) => set({
    todayCalories: calories,
    todayProtein: protein,
    todayCarbs: carbs,
    todayFat: fat
  }),
  
  setCaloriesTarget: (target) => set({ caloriesTarget: target })
}))

// Helper to check if paywall should show
export function shouldShowPaywall(): boolean {
  const { dailyUsageCount, isVIP } = useAppStore.getState()
  return dailyUsageCount >= 3 && !isVIP
}
