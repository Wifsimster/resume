<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { RouterView } from 'vue-router'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher.vue'
import AchievementToast from '@presentation/components/ui/AchievementToast.vue'
import AchievementsIndicator from '@presentation/components/ui/AchievementsIndicator.vue'
import FPSDisplay from '@presentation/components/ui/FPSDisplay.vue'
import TableOfContents from '@presentation/components/ui/TableOfContents.vue'
import { useAchievements } from '@application/composables/useAchievements'
import { useEasterEggs } from '@application/composables/useEasterEggs'

const { currentAchievement, showAchievement, dismissAchievement, unlock, isUnlocked } = useAchievements()

// Initialize easter eggs listener
const { fpsEnabled } = useEasterEggs()

// FPS display ref
const fpsDisplayRef = ref<InstanceType<typeof FPSDisplay> | null>(null)

// Watch for FPS enable/disable
watch(fpsEnabled, async (enabled) => {
  await nextTick()
  if (fpsDisplayRef.value) {
    if (enabled) {
      fpsDisplayRef.value.start()
    } else {
      fpsDisplayRef.value.stop()
    }
  }
})

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
  // Auto-enable FPS display in development
  if (import.meta.env.DEV && fpsDisplayRef.value) {
    fpsDisplayRef.value.start()
  }

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
  <div class="min-h-screen bg-(--color-bg-primary)">
    <!-- Fixed UI Elements -->
    <header class="fixed top-4 right-4 z-100 flex gap-3 items-center sm:top-2 sm:right-2 sm:gap-2">
      <AchievementsIndicator />
      <LanguageSwitcher />
    </header>
    
    <!-- Table of Contents (Desktop only) -->
    <TableOfContents />
    
    <!-- Main Content -->
    <RouterView />
    
    <!-- Achievement Toast -->
    <AchievementToast
      v-if="showAchievement && currentAchievement"
      :achievement="currentAchievement"
      @close="dismissAchievement"
    />
    
    <!-- FPS Display -->
    <FPSDisplay ref="fpsDisplayRef" />
  </div>
</template>

