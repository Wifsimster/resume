<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'

const { quality, toggleQuality } = useQuality()
const { t } = useI18n()
const { unlock } = useAchievements()

const qualityLabel = computed(() => quality.value === 'high' ? t('common.qualityHigh') : t('common.qualityLow'))
const qualityTitle = computed(() => t('common.quality'))

const handleToggle = () => {
  toggleQuality()
  unlock('qualityToggler')
}
</script>

<template>
  <button
    class="flex items-center gap-1.5 py-2 px-3 bg-[#1E1E1E]/80 backdrop-blur-md border border-(--color-border) rounded-lg cursor-pointer transition-all duration-150 font-(--font-code) text-xs text-(--color-text-primary) hover:border-(--color-accent-primary) hover:shadow-[var(--shadow-glow-green)] sm:p-2 sm:min-w-10 sm:min-h-10 sm:justify-center"
    @click="handleToggle"
    :title="qualityTitle"
    :aria-label="qualityTitle"
  >
    <span class="text-sm sm:text-lg">{{ quality === 'high' ? '✨' : '⚡' }}</span>
    <span class="uppercase tracking-wide sm:hidden">{{ qualityLabel }}</span>
  </button>
</template>

