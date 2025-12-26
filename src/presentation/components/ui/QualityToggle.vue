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
    class="quality-toggle"
    @click="handleToggle"
    :title="qualityTitle"
    :aria-label="qualityTitle"
  >
    <span class="quality-icon">{{ quality === 'high' ? '✨' : '⚡' }}</span>
    <span class="quality-label">{{ qualityLabel }}</span>
  </button>
</template>

<style scoped>
.quality-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: var(--color-text-primary);
}

.quality-toggle:hover {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-glow-green);
}

.quality-icon {
  font-size: 0.9rem;
}

.quality-label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Mobile responsive - hide label, keep icon for touch target */
@media (max-width: 480px) {
  .quality-toggle {
    padding: 0.5rem;
    min-width: 40px;
    min-height: 40px;
    justify-content: center;
  }
  
  .quality-label {
    display: none;
  }
  
  .quality-icon {
    font-size: 1.1rem;
  }
}
</style>

