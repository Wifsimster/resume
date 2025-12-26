<script setup lang="ts">
import { useScrollSection } from '@application/composables/useScrollSection'

const { currentSectionIndex, totalSections, progressPercent } = useScrollSection()
</script>

<template>
  <div class="xp-bar-container">
    <div class="xp-bar">
      <div 
        class="xp-bar-fill" 
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
    <div class="xp-label">
      <span class="xp-current">{{ currentSectionIndex + 1 }}</span>
      <span class="xp-separator">/</span>
      <span class="xp-total">{{ totalSections }}</span>
    </div>
  </div>
</template>

<style scoped>
.xp-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.xp-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-terminal-green), var(--color-vue-green));
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.xp-label {
  font-family: var(--font-code);
  font-size: 0.7rem;
  color: var(--color-terminal-green);
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 40px;
}

.xp-current {
  font-weight: 600;
}

.xp-separator {
  opacity: 0.5;
}

.xp-total {
  opacity: 0.7;
}
</style>

