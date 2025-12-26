<script setup lang="ts">
import { RouterView } from 'vue-router'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher.vue'
import QualityToggle from '@presentation/components/ui/QualityToggle.vue'
import AchievementToast from '@presentation/components/ui/AchievementToast.vue'
import { useAchievements } from '@application/composables/useAchievements'
import { useEasterEggs } from '@application/composables/useEasterEggs'

const { currentAchievement, showAchievement, dismissAchievement } = useAchievements()

// Initialize easter eggs listener
useEasterEggs()
</script>

<template>
  <div class="app-container">
    <!-- Fixed UI Elements -->
    <header class="fixed-header">
      <LanguageSwitcher />
      <QualityToggle />
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
</style>

