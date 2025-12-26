<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import ExperienceScene from '@presentation/components/three/scenes/ExperienceScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()
</script>

<template>
  <section class="section experience-section" data-section="experience">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <ExperienceScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="experience-header">
        <h2 class="section-title">{{ t('experience.title') }}</h2>
        <p class="section-subtitle">{{ t('experience.subtitle') }}</p>
      </div>

      <div class="timeline">
        <div 
          v-for="exp in resumeData.experiences" 
          :key="exp.id"
          class="timeline-item glass"
          :class="{ current: exp.current }"
        >
          <div class="timeline-marker">
            <div class="marker-dot" />
            <div class="marker-line" />
          </div>
          
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-meta">
                <span class="company">{{ exp.company }}</span>
                <span v-if="exp.current" class="current-badge">{{ t('experience.current') }}</span>
              </div>
              <span class="period">{{ exp.period }}</span>
            </div>
            
            <h3 class="job-title">{{ t(`experience.${exp.id}.title`) }}</h3>
            <p class="job-description">{{ t(`experience.${exp.id}.description`) }}</p>
            
            <div class="achievements">
              <h4>{{ t('experience.achievements') }}</h4>
              <ul>
                <li v-for="(achievement, index) in exp.achievements" :key="index">
                  <span class="achievement-icon">✓</span>
                  {{ achievement }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience-section {
  background: transparent;
}

.experience-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-terminal-green);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.timeline-item.current {
  border-color: var(--color-terminal-green);
  box-shadow: var(--shadow-glow-green);
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-terminal-green);
  box-shadow: 0 0 10px var(--color-terminal-green);
}

.timeline-item.current .marker-dot {
  animation: pulse-glow 2s ease-in-out infinite;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, var(--color-terminal-green), transparent);
  margin-top: 0.5rem;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.company {
  font-family: var(--font-code);
  font-size: 0.9rem;
  color: var(--color-vue-green);
}

.current-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-terminal-green);
  color: var(--color-wood-dark);
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
}

.period {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.job-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--color-paper-cream);
  margin-bottom: 0.5rem;
}

.job-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.achievements h4 {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: var(--color-terminal-green);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.achievements ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.achievements li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.achievement-icon {
  color: var(--color-terminal-green);
  font-weight: bold;
}

@media (max-width: 768px) {
  .timeline-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .timeline-marker {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .marker-line {
    width: auto;
    height: 2px;
    flex: 1;
    margin-top: 0;
    background: linear-gradient(90deg, var(--color-terminal-green), transparent);
  }
}

@media (max-width: 480px) {
  .timeline-item {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .job-title {
    font-size: 1.4rem;
  }
  
  .job-description {
    font-size: 0.9rem;
  }
  
  .achievements ul {
    grid-template-columns: 1fr;
  }
  
  .achievements li {
    font-size: 0.85rem;
  }
}
</style>

