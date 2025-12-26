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

</script>

<template>
  <section class="section leadership-section" data-section="leadership">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <LeadershipScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="leadership-header">
        <h2 class="section-title">{{ t('leadership.title') }}</h2>
        <p class="section-subtitle">{{ t('leadership.subtitle') }}</p>
      </div>

      <div class="leadership-grid">
        <!-- Stats -->
        <div class="stats-card glass">
          <div class="stats-header">
            <h3>{{ t('leadership.presentations') }}</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item" v-for="stat in stats" :key="stat.key">
              <div class="stat-icon-wrapper">
                <span class="stat-icon">{{ stat.icon }}</span>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ t(`leadership.${stat.key}`) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conferences -->
        <div class="conferences-card glass">
          <div class="conferences-header">
            <h3>{{ t('leadership.conferences') }}</h3>
            <p class="conferences-subtitle">{{ t('leadership.mentoring') }}</p>
          </div>
          <ul class="conference-list">
            <li class="conference-item">
              <div class="conference-content">
                <span class="conf-badge speaker">Speaker</span>
                <span class="conf-name">Hexagone Tour 2024</span>
              </div>
            </li>
            <li class="conference-item">
              <div class="conference-content">
                <span class="conf-badge attendee">Attendee</span>
                <span class="conf-name">BDX I/O 2023, 2024, 2025</span>
              </div>
            </li>
            <li class="conference-item">
              <div class="conference-content">
                <span class="conf-badge attendee">Attendee</span>
                <span class="conf-name">DevQuest 2024</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.leadership-section {
  background: linear-gradient(180deg, #050505 0%, var(--color-bg-primary) 50%, #050505 100%);
}

.leadership-header {
  text-align: center;
  margin-bottom: 3rem;
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

.leadership-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all var(--transition-normal);
  border-left: 3px solid var(--color-team-orange);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(249, 115, 22, 0.2);
  border-left-color: var(--color-team-orange);
}

.stats-header h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-team-orange);
  margin: 0;
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--color-team-orange);
  transform: scaleY(0);
  transition: transform var(--transition-fast);
}

.stat-item:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(249, 115, 22, 0.3);
  transform: translateX(4px);
}

.stat-item:hover::before {
  transform: scaleY(1);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.2);
  flex-shrink: 0;
}

.stat-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.5));
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-team-orange);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

.conferences-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all var(--transition-normal);
  border-left: 3px solid var(--color-terminal-green);
}

.conferences-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
  border-left-color: var(--color-terminal-green);
}

.conferences-header h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-terminal-green);
  margin: 0;
  margin-bottom: 0.25rem;
}

.conferences-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.conference-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conference-item {
  padding: 0;
  margin: 0;
}

.conference-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.1);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.conference-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--color-terminal-green);
  transform: scaleY(0);
  transition: transform var(--transition-fast);
}

.conference-content:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateX(4px);
}

.conference-content:hover::before {
  transform: scaleY(1);
}

.conf-badge {
  font-size: 0.7rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  font-family: var(--font-code);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.conf-badge.speaker {
  background: linear-gradient(135deg, var(--color-team-orange), #FB923C);
  color: white;
}

.conf-badge.attendee {
  background: linear-gradient(135deg, var(--color-terminal-green), #C084FC);
  color: white;
}

.conf-name {
  font-size: 0.95rem;
  color: var(--color-paper-cream);
  font-weight: 500;
  flex: 1;
}

@media (max-width: 900px) {
  .leadership-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    justify-content: flex-start;
  }
}
</style>

