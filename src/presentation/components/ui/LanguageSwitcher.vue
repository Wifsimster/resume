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
    class="relative flex items-center justify-between w-[70px] h-8 p-0.5 bg-[#1A1410]/80 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-200 hover:border-white/20 sm:w-16 sm:h-9"
    @click="switchLanguage"
    :aria-label="isFrench ? 'Switch to English' : 'Passer en français'"
  >
    <span 
      class="flex items-center justify-center w-7 h-7 text-xl rounded-full transition-all duration-200 select-none sm:w-6.5 sm:h-6.5"
      :class="isFrench ? 'opacity-100 bg-white/10' : 'opacity-50'"
    >🇫🇷</span>
    <span 
      class="flex items-center justify-center w-7 h-7 text-xl rounded-full transition-all duration-200 select-none sm:w-6.5 sm:h-6.5"
      :class="!isFrench ? 'opacity-100 bg-white/10' : 'opacity-50'"
    >🇬🇧</span>
  </button>
</template>

