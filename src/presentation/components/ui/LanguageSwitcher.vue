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
    class="relative flex items-center justify-between w-[70px] h-8 p-0.5 bg-[var(--color-surface-overlay)] backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-200 hover:border-white/20 sm:w-16 sm:h-9"
    @click="switchLanguage"
    :aria-label="isFrench ? 'Switch to English' : 'Passer en français'"
  >
    <span
      class="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 select-none sm:w-6.5 sm:h-6.5"
      :class="isFrench ? 'opacity-100 ring-1 ring-white/40' : 'opacity-50'"
    >
      <svg
        class="w-5 h-5 rounded-full"
        viewBox="0 0 30 30"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Français"
      >
        <rect width="10" height="30" fill="#0055A4" />
        <rect x="10" width="10" height="30" fill="#FFFFFF" />
        <rect x="20" width="10" height="30" fill="#EF4135" />
      </svg>
    </span>
    <span
      class="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 select-none sm:w-6.5 sm:h-6.5"
      :class="!isFrench ? 'opacity-100 ring-1 ring-white/40' : 'opacity-50'"
    >
      <svg
        class="w-5 h-5 rounded-full"
        viewBox="15 0 30 30"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="English"
      >
        <clipPath id="uk-flag-quadrants">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clip-path="url(#uk-flag-quadrants)"
          stroke="#C8102E"
          stroke-width="4"
        />
        <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" stroke-width="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6" />
      </svg>
    </span>
  </button>
</template>

