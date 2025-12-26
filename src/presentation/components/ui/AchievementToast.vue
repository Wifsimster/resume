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
    class="fixed bottom-8 right-8 sm:bottom-4 sm:right-4 sm:left-4 bg-gradient-to-br from-(--color-bg-tertiary) to-(--color-bg-primary) border-2 border-(--color-accent-primary) rounded-xl py-4 px-6 sm:py-3 sm:px-4 flex items-center gap-4 z-[1001] animate-[achievement-slide-in_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)] shadow-[0_0_30px_rgba(124,58,237,0.3),0_10px_40px_rgba(0,0,0,0.5)] cursor-pointer max-w-[350px] sm:max-w-none"
    @click="emit('close')"
  >
    <div class="text-4xl sm:text-3xl animate-icon-bounce [filter:drop-shadow(0_0_10px_rgba(124,58,237,0.5))]">{{ achievement.icon }}</div>
    <div class="flex flex-col gap-0.5">
      <span class="font-(--font-code) text-[0.7rem] uppercase tracking-widest text-(--color-accent-primary)">{{ t('achievements.unlocked') }}</span>
      <span class="font-(--font-display) text-2xl sm:text-xl font-bold text-(--color-paper-cream)">{{ achievement.name }}</span>
      <span class="text-xs text-white/70">{{ achievement.description }}</span>
    </div>
    <button 
      class="absolute top-2 right-2 bg-transparent border-none text-white/50 text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center transition-colors duration-150 hover:text-(--color-paper-cream)"
      @click.stop="emit('close')" 
      aria-label="Close"
    >
      ×
    </button>
  </div>
</template>

