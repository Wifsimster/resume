<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@application/i18n'
import { useAchievements } from '@application/composables/useAchievements'

const { locale } = useI18n()
const { unlock } = useAchievements()

const isFrench = computed(() => locale.value === 'fr')

const switchLanguage = () => {
  const newLocale = locale.value === 'fr' ? 'en' : 'fr'
  setLocale(newLocale)
  unlock('bilingual')
}
</script>

<template>
  <button
    class="language-switch"
    @click="switchLanguage"
    :aria-label="isFrench ? 'Switch to English' : 'Passer en français'"
  >
    <span class="flag flag-fr" :class="{ active: isFrench }">🇫🇷</span>
    <span class="flag flag-en" :class="{ active: !isFrench }">🇬🇧</span>
  </button>
</template>

<style scoped>
.language-switch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 70px;
  height: 32px;
  padding: 2px;
  background: rgba(26, 20, 16, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-switch:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.flag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 1.2rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.5;
  user-select: none;
}

.flag.active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile responsive - ensure good touch target */
@media (max-width: 480px) {
  .language-switch {
    width: 64px;
    height: 36px;
  }
  
  .flag {
    width: 26px;
    height: 26px;
  }
}
</style>

