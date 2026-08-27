import { create } from 'zustand'

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
  { id: 'nightOwl', name: 'Night Owl', description: 'Visited in dark mode', icon: '🦉', unlocked: false },
  { id: 'firstVisit', name: 'Welcome', description: 'First time visiting', icon: '👋', unlocked: false },
  { id: 'returnVisitor', name: 'Return Visitor', description: 'Came back for more', icon: '🔄', unlocked: false },
  { id: 'earlyBird', name: 'Early Bird', description: 'Visited between 5AM and 8AM', icon: '🌅', unlocked: false },
  { id: 'weekendWarrior', name: 'Weekend Warrior', description: 'Visited on a weekend', icon: '🎉', unlocked: false },
  { id: 'timeSpent', name: 'Deep Diver', description: 'Spent 5+ minutes exploring', icon: '🤿', unlocked: false },
  { id: 'scrollMaster', name: 'Scroll Master', description: 'Scrolled over 10,000 pixels', icon: '📜', unlocked: false },
  { id: 'clickHappy', name: 'Click Happy', description: 'Clicked 50 times', icon: '🖱️', unlocked: false },
  { id: 'qualityToggler', name: 'Graphics Guru', description: 'Toggled quality settings', icon: '🎨', unlocked: false },
  { id: 'makerFan', name: 'Maker Fan', description: 'Explored the maker section', icon: '🔧', unlocked: false },
  { id: 'patience', name: 'Patient One', description: 'Waited for all 3D to load', icon: '⏳', unlocked: false },
  { id: 'contactAttempt', name: 'Reach Out', description: 'Opened contact section', icon: '✉️', unlocked: false },
  { id: 'githubVisitor', name: 'Open Sourcer', description: 'Clicked on a GitHub link', icon: '🐙', unlocked: false },
  { id: 'consoleExplorer', name: 'Console Explorer', description: 'Found the console easter egg', icon: '💻', unlocked: false },
  { id: 'bookBuyer', name: 'Book Buyer', description: 'Clicked on a book to buy', icon: '🛒', unlocked: false },
  { id: 'nightExplorer', name: 'Night Explorer', description: 'Visited after midnight', icon: '🌙', unlocked: false },
  { id: 'keyboardNinja', name: 'Keyboard Ninja', description: 'Navigated with keyboard', icon: '🥷', unlocked: false },
  { id: 'boomerang', name: 'Boomerang', description: 'Scrolled to bottom then back to top', icon: '🪃', unlocked: false },
  { id: 'mobileScout', name: 'Mobile Scout', description: 'Visited from a mobile device', icon: '📱', unlocked: false },
  { id: 'printReady', name: 'Print Ready', description: 'Tried to print the resume', icon: '🖨️', unlocked: false },
  { id: 'devotedReader', name: 'Devoted Reader', description: 'Spent 10+ minutes exploring', icon: '📖', unlocked: false },
  { id: 'frequentFlyer', name: 'Frequent Flyer', description: 'Visited on 3 different days', icon: '✈️', unlocked: false },
  { id: 'secretWhisper', name: 'Secret Whisper', description: 'Typed the secret word', icon: '🤫', unlocked: false }
]

// Load from localStorage
const loadAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Achievement[]
      // Merge with defaults to ensure new achievements are included
      return defaultAchievements.map(def => {
        const stored = parsed.find(a => a.id === def.id)
        return stored ? { ...def, ...stored } : def
      })
    }
  } catch (e) {
    console.warn('Failed to load achievements:', e)
  }
  return [...defaultAchievements]
}

const persist = (achievements: Achievement[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements))
}

interface AchievementsState {
  achievements: Achievement[]
  currentAchievement: Achievement | null
  showAchievement: boolean
  unlock: (id: string) => boolean
  dismissAchievement: () => void
  isUnlocked: (id: string) => boolean
  resetAchievements: () => void
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  achievements: loadAchievements(),
  currentAchievement: null,
  showAchievement: false,

  unlock: (id) => {
    const achievement = get().achievements.find(a => a.id === id)
    if (!achievement || achievement.unlocked) return false

    const unlocked = { ...achievement, unlocked: true, unlockedAt: new Date() }
    const achievements = get().achievements.map(a => (a.id === id ? unlocked : a))
    persist(achievements)

    // Show toast
    set({ achievements, currentAchievement: unlocked, showAchievement: true })

    // Auto-hide after 5 seconds
    setTimeout(() => {
      set({ showAchievement: false })
    }, 5000)

    // Check for completionist: all non-completionist achievements unlocked
    const nonCompletionist = achievements.filter(a => a.id !== 'completionist')
    if (nonCompletionist.every(a => a.unlocked)) {
      get().unlock('completionist')
    }

    return true
  },

  dismissAchievement: () => {
    set({ showAchievement: false, currentAchievement: null })
  },

  isUnlocked: (id) => {
    return get().achievements.find(a => a.id === id)?.unlocked ?? false
  },

  resetAchievements: () => {
    set({ achievements: [...defaultAchievements] })
    localStorage.removeItem(STORAGE_KEY)
  }
}))

// Compat hook mirroring the old Vue composable API.
export function useAchievements() {
  const achievements = useAchievementsStore(s => s.achievements)
  const currentAchievement = useAchievementsStore(s => s.currentAchievement)
  const showAchievement = useAchievementsStore(s => s.showAchievement)
  const unlock = useAchievementsStore(s => s.unlock)
  const dismissAchievement = useAchievementsStore(s => s.dismissAchievement)
  const resetAchievements = useAchievementsStore(s => s.resetAchievements)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const progress = (unlockedCount / totalCount) * 100

  return {
    achievements,
    currentAchievement,
    showAchievement,
    unlockedCount,
    totalCount,
    progress,
    unlock,
    dismissAchievement,
    isUnlocked: (id: string) => useAchievementsStore.getState().isUnlocked(id),
    resetAchievements
  }
}
