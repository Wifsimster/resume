<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher.vue'
import AchievementToast from '@presentation/components/ui/AchievementToast.vue'
import AchievementsIndicator from '@presentation/components/ui/AchievementsIndicator.vue'
import { useAchievements } from '@application/composables/useAchievements'
import { useEasterEggs } from '@application/composables/useEasterEggs'

const { currentAchievement, showAchievement, dismissAchievement, unlock, isUnlocked } = useAchievements()

// Initialize easter eggs listener
useEasterEggs()

// Tracking state
const clickCount = ref(0)
const totalScrolled = ref(0)
const lastScrollY = ref(0)
const timeSpentInterval = ref<ReturnType<typeof setInterval> | null>(null)

const VISIT_STORAGE_KEY = 'wifsimster_visit_count'

// Check visit-related achievements
const checkVisitAchievements = () => {
  const visitCount = parseInt(localStorage.getItem(VISIT_STORAGE_KEY) || '0', 10)
  
  if (visitCount === 0) {
    unlock('firstVisit')
  } else {
    unlock('returnVisitor')
  }
  
  localStorage.setItem(VISIT_STORAGE_KEY, String(visitCount + 1))
}

// Check time-based achievements
const checkTimeAchievements = () => {
  const hour = new Date().getHours()
  const day = new Date().getDay()
  
  // Early bird: 5AM - 8AM
  if (hour >= 5 && hour < 8) {
    unlock('earlyBird')
  }
  
  // Weekend warrior: Saturday (6) or Sunday (0)
  if (day === 0 || day === 6) {
    unlock('weekendWarrior')
  }
}

// Track clicks
const handleClick = () => {
  clickCount.value++
  if (clickCount.value >= 50 && !isUnlocked('clickHappy')) {
    unlock('clickHappy')
  }
}

// Track scroll distance
const handleScroll = () => {
  const currentScrollY = window.scrollY
  const scrollDiff = Math.abs(currentScrollY - lastScrollY.value)
  totalScrolled.value += scrollDiff
  lastScrollY.value = currentScrollY
  
  if (totalScrolled.value >= 10000 && !isUnlocked('scrollMaster')) {
    unlock('scrollMaster')
  }
}

// Track time spent
const startTimeTracking = () => {
  const startTime = Date.now()
  
  timeSpentInterval.value = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000 / 60 // minutes
    if (elapsed >= 5 && !isUnlocked('timeSpent')) {
      unlock('timeSpent')
      if (timeSpentInterval.value) {
        clearInterval(timeSpentInterval.value)
      }
    }
  }, 10000) // Check every 10 seconds
}

// Check 3D load completion for patience achievement
const checkPatienceAchievement = () => {
  // Unlock after page fully loads (including 3D)
  window.addEventListener('load', () => {
    setTimeout(() => {
      unlock('patience')
    }, 3000) // Wait 3 seconds after full load
  }, { once: true })
}

onMounted(() => {
  checkVisitAchievements()
  checkTimeAchievements()
  checkPatienceAchievement()
  startTimeTracking()
  
  lastScrollY.value = window.scrollY
  window.addEventListener('click', handleClick)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('click', handleClick)
  window.removeEventListener('scroll', handleScroll)
  if (timeSpentInterval.value) {
    clearInterval(timeSpentInterval.value)
  }
})
</script>

<template>
  <div class="app-container">
    <!-- Fixed UI Elements -->
    <header class="fixed-header">
      <AchievementsIndicator />
      <LanguageSwitcher />
    </header>
    
    <!-- Main Content -->
    <RouterView />
    
    <!-- Achievement Toast -->
    <AchievementToast
      v-if="showAchievement && currentAchievement"
      :achievement="currentAchievement"
      @close="dismissAchievement"
    />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.fixed-header {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .fixed-header {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.5rem;
  }
}
</style>

