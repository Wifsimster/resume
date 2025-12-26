<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import AboutScene from '@presentation/components/three/scenes/AboutScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()
</script>

<template>
  <section class="section about-section" data-section="about">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <AboutScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="about-header">
        <h2 class="section-title">{{ t('about.title') }}</h2>
        <p class="section-subtitle">{{ t('about.subtitle') }}</p>
      </div>

      <div class="about-grid">
        <!-- Bio Card -->
        <div class="about-card glass">
          <h3>{{ t('about.philosophy') }}</h3>
          <p class="bio">{{ t('about.intro') }}</p>
        </div>

        <!-- Passions Grid -->
        <div class="passions-card glass">
          <h3>{{ t('about.passions.title') }}</h3>
          <div class="passions-grid">
            <div 
              v-for="passion in resumeData.passions" 
              :key="passion.id"
              class="passion-item"
              :style="{ '--passion-color': passion.color }"
            >
              <span class="passion-icon">{{ passion.icon }}</span>
              <span class="passion-name">{{ t(`about.passions.${passion.id}`) }}</span>
            </div>
          </div>
        </div>

        <!-- Gaming Hobby Card -->
        <div class="hobby-card glass">
          <h3>{{ t('about.hobby') }}</h3>
          <div class="hobby-content">
            <span class="hobby-icon">🛠️</span>
            <p>{{ t('about.gaming') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background: transparent;
}

.about-header {
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

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.about-card,
.passions-card,
.hobby-card {
  padding: 1.5rem;
}

.about-card {
  grid-column: 1 / -1;
}

.about-card h3,
.passions-card h3,
.hobby-card h3 {
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--color-accent-secondary);
  margin-bottom: 1rem;
  font-weight: 700;
}

.bio {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-paper-cream);
}

.passions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.passion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border-left: 3px solid var(--passion-color);
  transition: all var(--transition-fast);
}

.passion-item:hover {
  background: rgba(0, 0, 0, 0.25);
  transform: translateX(4px);
}

.passion-icon {
  font-size: 1.25rem;
}

.passion-name {
  font-size: 0.85rem;
  color: var(--color-paper-cream);
}

.hobby-card {
  display: flex;
  flex-direction: column;
}

.hobby-content {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.hobby-icon {
  font-size: 3.5rem;
  animation: float 3s ease-in-out infinite;
  filter: hue-rotate(240deg) saturate(1.2) brightness(1.1);
  flex-shrink: 0;
}

.hobby-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  flex: 1;
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  
  .passions-card,
  .hobby-card {
    grid-column: 1;
  }
}
</style>

