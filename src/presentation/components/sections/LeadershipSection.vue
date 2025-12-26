<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import LeadershipScene from '@presentation/components/three/scenes/LeadershipScene.vue'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { quality } = useQuality()

const stats = [
  { key: 'recruited', value: '2', icon: '👥' },
  { key: 'interns', value: '3', icon: '🎓' },
  { key: 'apprentices', value: '1', icon: '📚' },
  { key: 'monthlyPresentations', value: '1', icon: '🎤' },
  { key: 'architectureMeetings', value: '1', icon: '🏗️' }
]

const conferences = [
  { badge: 'Speaker', name: 'Hexagone Tour 2024', type: 'speaker' },
  { badge: 'Attendee', name: 'BDX I/O 2023-25', type: 'attendee' },
  { badge: 'Attendee', name: 'DevQuest 2024', type: 'attendee' }
]
</script>

<template>
  <section class="section leadership-section" data-section="leadership">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <LeadershipScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content - positioned to the left -->
    <div class="section-content leadership-content">
      <div class="leadership-panel glass">
        <!-- Header -->
        <div class="leadership-header">
          <h2 class="section-title">{{ t('leadership.title') }}</h2>
          <p class="section-subtitle">{{ t('leadership.subtitle') }}</p>
        </div>

        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-chip" v-for="stat in stats" :key="stat.key">
            <span class="stat-icon">{{ stat.icon }}</span>
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ t(`leadership.${stat.key}`) }}</span>
          </div>
        </div>

        <!-- Conferences -->
        <div class="conferences-section">
          <h3 class="conferences-title">{{ t('leadership.conferences') }}</h3>
          <div class="conferences-row">
            <div 
              v-for="conf in conferences" 
              :key="conf.name"
              class="conf-chip"
              :class="conf.type"
            >
              <span class="conf-badge">{{ conf.badge }}</span>
              <span class="conf-name">{{ conf.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.leadership-section {
  background: transparent;
}

.leadership-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 2rem;
}

.leadership-panel {
  max-width: 420px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-left: 3px solid var(--color-team-orange);
  background: rgba(10, 10, 10, 0.75);
}

.leadership-header {
  text-align: left;
}

.section-title {
  color: var(--color-team-orange);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Stats Row - Compact chips */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.65rem;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.stat-chip:hover {
  background: rgba(249, 115, 22, 0.2);
  border-color: rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}

.stat-chip .stat-icon {
  font-size: 1rem;
}

.stat-chip .stat-value {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-team-orange);
}

.stat-chip .stat-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 70px;
  line-height: 1.1;
}

/* Conferences Section */
.conferences-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.conferences-title {
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--color-terminal-green);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.conferences-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.conf-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  border: 1px solid rgba(168, 85, 247, 0.15);
  transition: all var(--transition-fast);
}

.conf-chip:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: translateX(4px);
}

.conf-chip.speaker {
  border-left: 2px solid var(--color-team-orange);
}

.conf-chip.attendee {
  border-left: 2px solid var(--color-terminal-green);
}

.conf-badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.3px;
  font-family: var(--font-code);
}

.conf-chip.speaker .conf-badge {
  background: var(--color-team-orange);
  color: white;
}

.conf-chip.attendee .conf-badge {
  background: var(--color-terminal-green);
  color: white;
}

.conf-name {
  font-size: 0.85rem;
  color: var(--color-paper-cream);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 900px) {
  .leadership-content {
    justify-content: center;
    padding-left: 0;
  }
  
  .leadership-panel {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .leadership-panel {
    padding: 1rem;
    gap: 1rem;
  }
  
  .stat-chip {
    padding: 0.35rem 0.5rem;
  }
  
  .stat-chip .stat-label {
    max-width: 60px;
    font-size: 0.65rem;
  }
  
  .conf-chip {
    padding: 0.4rem 0.6rem;
  }
  
  .conf-name {
    font-size: 0.8rem;
  }
}
</style>

