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
  <div class="achievement-toast" @click="emit('close')">
    <div class="achievement-icon">{{ achievement.icon }}</div>
    <div class="achievement-content">
      <span class="achievement-title">{{ t('achievements.unlocked') }}</span>
      <span class="achievement-name">{{ achievement.name }}</span>
      <span class="achievement-desc">{{ achievement.description }}</span>
    </div>
    <button class="achievement-close" @click.stop="emit('close')" aria-label="Close">
      ×
    </button>
  </div>
</template>

<style scoped>
.achievement-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-primary));
  border: 2px solid var(--color-accent-primary);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1001;
  animation: achievement-slide-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 
    0 0 30px rgba(124, 58, 237, 0.3),
    0 10px 40px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  max-width: 350px;
}

@keyframes achievement-slide-in {
  from {
    transform: translateX(120%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

.achievement-icon {
  font-size: 2.5rem;
  animation: icon-bounce 0.5s ease infinite alternate;
  filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.5));
}

@keyframes icon-bounce {
  from { transform: scale(1) rotate(-5deg); }
  to { transform: scale(1.1) rotate(5deg); }
}

.achievement-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.achievement-title {
  font-family: var(--font-code);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent-primary);
}

.achievement-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-paper-cream);
}

.achievement-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.achievement-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.achievement-close:hover {
  color: var(--color-paper-cream);
}
</style>

