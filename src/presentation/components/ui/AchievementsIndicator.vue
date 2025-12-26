<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { achievements, unlockedCount, totalCount, progress } = useAchievements()

const isOpen = ref(false)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

const sortedAchievements = computed(() => {
  return [...achievements.value].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    return 0
  })
})
</script>

<template>
  <div class="achievements-indicator">
    <button 
      class="achievements-trigger" 
      @click="togglePanel"
      :title="t('achievements.viewAll')"
    >
      <span class="trigger-icon">🏆</span>
      <span class="trigger-count">{{ unlockedCount }}/{{ totalCount }}</span>
    </button>

    <Teleport to="body">
      <Transition name="panel">
        <div v-if="isOpen" class="achievements-overlay" @click="closePanel">
          <div class="achievements-panel" @click.stop>
            <div class="panel-header">
              <h3 class="panel-title">{{ t('achievements.title') }}</h3>
              <button class="panel-close" @click="closePanel" aria-label="Close">×</button>
            </div>

            <div class="panel-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${progress}%` }" />
              </div>
              <span class="progress-text">{{ unlockedCount }} / {{ totalCount }}</span>
            </div>

            <div class="achievements-list">
              <div 
                v-for="achievement in sortedAchievements" 
                :key="achievement.id"
                class="achievement-item"
                :class="{ unlocked: achievement.unlocked }"
              >
                <div class="achievement-icon">{{ achievement.unlocked ? achievement.icon : '🔒' }}</div>
                <div class="achievement-info">
                  <span class="achievement-name">
                    {{ achievement.unlocked ? t(`achievements.${achievement.id}.name`) : '???' }}
                  </span>
                  <span class="achievement-desc">
                    {{ achievement.unlocked ? t(`achievements.${achievement.id}.desc`) : t('achievements.locked') }}
                  </span>
                </div>
                <div v-if="achievement.unlocked" class="achievement-check">✓</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.achievements-indicator {
  position: relative;
}

.achievements-trigger {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.achievements-trigger:hover {
  border-color: var(--color-achievement-gold);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

.trigger-icon {
  font-size: 1rem;
  animation: trophy-shine 3s ease-in-out infinite;
}

@keyframes trophy-shine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3) drop-shadow(0 0 5px rgba(251, 191, 36, 0.5)); }
}

.trigger-count {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Overlay */
.achievements-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Panel */
.achievements-panel {
  background: linear-gradient(145deg, var(--color-bg-tertiary), var(--color-bg-primary));
  border: 2px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 0 60px rgba(124, 58, 237, 0.2),
    0 20px 60px rgba(0, 0, 0, 0.6);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.3);
}

.panel-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-achievement-gold);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-title::before {
  content: '🏆';
}

.panel-close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.panel-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

/* Progress */
.panel-progress {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-achievement-gold), #F59E0B);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.progress-text {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--color-achievement-gold);
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

/* Achievements List */
.achievements-list {
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 0.5rem;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.achievement-item:last-child {
  margin-bottom: 0;
}

.achievement-item:not(.unlocked) {
  opacity: 0.5;
}

.achievement-item.unlocked {
  background: rgba(251, 191, 36, 0.05);
  border-color: rgba(251, 191, 36, 0.2);
}

.achievement-item.unlocked:hover {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
}

.achievement-icon {
  font-size: 1.75rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  flex-shrink: 0;
}

.achievement-item.unlocked .achievement-icon {
  background: rgba(251, 191, 36, 0.1);
  animation: icon-glow 2s ease-in-out infinite alternate;
}

@keyframes icon-glow {
  from { box-shadow: 0 0 5px rgba(251, 191, 36, 0.2); }
  to { box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); }
}

.achievement-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.achievement-name {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.achievement-item.unlocked .achievement-name {
  color: var(--color-achievement-gold);
}

.achievement-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.achievement-check {
  width: 24px;
  height: 24px;
  background: var(--color-achievement-gold);
  color: var(--color-bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Transitions */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.3s ease;
}

.panel-enter-active .achievements-panel,
.panel-leave-active .achievements-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .achievements-panel,
.panel-leave-to .achievements-panel {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Mobile */
@media (max-width: 480px) {
  .achievements-panel {
    max-height: 90vh;
    border-radius: 12px;
  }

  .achievement-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>

