<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MakerScene from '@presentation/components/three/scenes/MakerScene.vue'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { quality } = useQuality()

const makerItems = [
  { key: 'esp8266', icon: '📡', color: '#00979D' },
  { key: 'led', icon: '💡', color: '#FFD700' },
  { key: 'woodworking', icon: '🪵', color: '#8B5A2B' },
  { key: 'renovation', icon: '🏠', color: '#B87333' },
  { key: 'domotics', icon: '🏡', color: '#03A9F4' },
  { key: 'unify', icon: '🌐', color: '#4CAF50' },
  { key: 'selfHosting', icon: '🖥️', color: '#9C27B0' }
]
</script>

<template>
  <section class="section maker-section" data-section="maker">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <MakerScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="maker-header">
        <h2 class="section-title">{{ t('maker.title') }}</h2>
        <p class="section-subtitle">{{ t('maker.subtitle') }}</p>
      </div>

      <div class="maker-grid">
        <div class="maker-intro glass">
          <p>{{ t('about.passions.makingDesc') }}</p>
        </div>
        
        <div class="maker-items">
          <div 
            v-for="item in makerItems" 
            :key="item.key"
            class="maker-item glass"
            :style="{ '--item-color': item.color }"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ t(`maker.${item.key}`) }}</span>
          </div>
        </div>

        <div class="projects-showcase glass">
          <h3>{{ t('maker.projects') }}</h3>
          <div class="diy-projects">
            <div class="diy-project">
              <span class="project-icon">🚿</span>
              <span>Italian Shower Build</span>
            </div>
            <div class="diy-project">
              <span class="project-icon">🏠</span>
              <span>Cellar & Office Renovation</span>
            </div>
            <div class="diy-project">
              <span class="project-icon">💡</span>
              <span>Ambilight LED System</span>
            </div>
            <div class="diy-project">
              <span class="project-icon">🤖</span>
              <span>Home Automation Hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.maker-section {
  background: transparent;
}

.maker-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-copper);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.maker-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.maker-intro {
  grid-column: 1 / -1;
  padding: 1.5rem;
  text-align: center;
}

.maker-intro p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

.maker-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.maker-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-left: 3px solid var(--item-color);
  transition: all var(--transition-fast);
}

.maker-item:hover {
  transform: translateX(4px);
  background: rgba(0, 0, 0, 0.25);
}

.item-icon {
  font-size: 1.5rem;
}

.item-name {
  font-size: 0.95rem;
  color: var(--color-paper-cream);
}

.projects-showcase {
  padding: 1.5rem;
}

.projects-showcase h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-copper);
  margin-bottom: 1rem;
}

.diy-projects {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.diy-project {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.project-icon {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .maker-grid {
    grid-template-columns: 1fr;
  }
  
  .maker-items {
    grid-template-columns: 1fr;
  }
}
</style>

