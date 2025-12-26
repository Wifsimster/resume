import { ref, computed, watch } from 'vue'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

const STORAGE_KEY = 'wifsimster_achievements'

// Default achievements
const defaultAchievements: Achievement[] = [
  { id: 'explorer', name: 'Explorer', description: 'Visited all sections', icon: '🗺️', unlocked: false },
  { id: 'bookworm', name: 'Bookworm', description: 'Viewed all books', icon: '📚', unlocked: false },
  { id: 'codeHunter', name: 'Code Hunter', description: 'Found the Konami code', icon: '🎮', unlocked: false },
  { id: 'networker', name: 'Networker', description: 'Clicked all social links', icon: '🔗', unlocked: false },
  { id: 'speedRunner', name: 'Speed Runner', description: 'Scrolled through site in < 30s', icon: '⚡', unlocked: false },
  { id: 'completionist', name: 'Completionist', description: 'Unlocked all achievements', icon: '🏆', unlocked: false },
  { id: 'bilingual', name: 'Bilingual', description: 'Switched language', icon: '🌍', unlocked: false },
  { id: 'nightOwl', name: 'Night Owl', description: 'Visited in dark mode', icon: '🦉', unlocked: false }
]

// Load from localStorage
const loadAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Achievement[]
      // Merge with defaults to ensure new achievements are included
      return defaultAchievements.map(def => {
        const saved = parsed.find(a => a.id === def.id)
        return saved ? { ...def, ...saved } : def
      })
    }
  } catch (e) {
    console.warn('Failed to load achievements:', e)
  }
  return [...defaultAchievements]
}

// Reactive state
const achievements = ref<Achievement[]>(loadAchievements())
const currentAchievement = ref<Achievement | null>(null)
const showAchievement = ref(false)

// Save to localStorage when achievements change
watch(achievements, (newAchievements) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newAchievements))
}, { deep: true })

// Computed
const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)
const totalCount = computed(() => achievements.value.length)
const progress = computed(() => (unlockedCount.value / totalCount.value) * 100)

// Unlock an achievement
const unlock = (id: string) => {
  const achievement = achievements.value.find(a => a.id === id)
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true
    achievement.unlockedAt = new Date()
    
    // Show toast
    currentAchievement.value = achievement
    showAchievement.value = true
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      showAchievement.value = false
    }, 5000)
    
    // Check for completionist
    checkCompletionist()
    
    return true
  }
  return false
}

// Check if all non-completionist achievements are unlocked
const checkCompletionist = () => {
  const nonCompletionist = achievements.value.filter(a => a.id !== 'completionist')
  const allUnlocked = nonCompletionist.every(a => a.unlocked)
  if (allUnlocked) {
    unlock('completionist')
  }
}

// Dismiss the toast
const dismissAchievement = () => {
  showAchievement.value = false
  currentAchievement.value = null
}

// Check if an achievement is unlocked
const isUnlocked = (id: string) => {
  return achievements.value.find(a => a.id === id)?.unlocked ?? false
}

// Reset all achievements
const resetAchievements = () => {
  achievements.value = [...defaultAchievements]
  localStorage.removeItem(STORAGE_KEY)
}

export function useAchievements() {
  return {
    achievements,
    currentAchievement,
    showAchievement,
    unlockedCount,
    totalCount,
    progress,
    unlock,
    dismissAchievement,
    isUnlocked,
    resetAchievements
  }
}

