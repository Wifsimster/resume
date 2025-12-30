<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Achievement } from '@application/composables/useAchievements'

defineProps<{
  achievement: Achievement
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
</script>

<template>
  <div 
    class="fixed bottom-8 right-8 left-4 sm:bottom-4 sm:right-4 md:left-auto bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-primary)] border-2 border-[var(--color-accent-primary)] rounded-xl py-4 pr-12 pl-6 sm:py-3 sm:pr-10 sm:pl-4 flex items-center gap-4 z-[1001] animate-[achievement-slide-in_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)] shadow-[0_0_30px_rgba(124,58,237,0.3),0_10px_40px_rgba(0,0,0,0.5)] cursor-pointer max-w-[350px] sm:max-w-none md:max-w-[350px]"
    @click="emit('close')"
  >
    <div class="text-4xl sm:text-3xl animate-icon-bounce [filter:drop-shadow(0_0_10px_rgba(124,58,237,0.5))]">{{ achievement.icon }}</div>
    <div class="flex flex-col gap-0.5">
      <span class="font-(--font-code) text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">{{ t('achievements.unlocked') }}</span>
      <span class="font-(--font-display) text-2xl sm:text-xl font-bold text-[var(--color-paper-cream)]">{{ t(`achievements.${achievement.id}.name`) }}</span>
      <span class="text-xs text-white/70">{{ t(`achievements.${achievement.id}.desc`) }}</span>
    </div>
    <button 
      class="absolute top-2 right-2 bg-transparent border-none text-white/50 text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center transition-colors duration-150 hover:text-[var(--color-paper-cream)]"
      @click.stop="emit('close')" 
      aria-label="Close"
    >
      ×
    </button>
  </div>
</template>

