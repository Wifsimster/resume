<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MakerScene from '@presentation/components/three/scenes/MakerScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { quality } = useQuality()
const { unlock } = useAchievements()

const techStack = [
  { icon: '🔌', label: 'ESP8266' },
  { icon: '🍓', label: 'Raspberry Pi' },
  { icon: '💡', label: 'LED WS2812' },
  { icon: '🏠', label: 'Home Assistant' },
  { icon: '🪵', label: 'Woodworking' }
]

// Unlock maker fan achievement when section becomes visible
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          unlock('makerFan')
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )
  
  const section = document.querySelector('[data-section="maker"]')
  if (section) {
    observer.observe(section)
  }
})
</script>

<template>
  <section class="section maker-section" data-section="maker">
    <!-- 3D Canvas - Full background -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <MakerScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Compact Content Overlay -->
    <div class="section-content maker-content">
      <div class="maker-panel glass">
        <div class="panel-header">
          <h2 class="section-title">{{ t('maker.title') }}</h2>
          <p class="section-subtitle">{{ t('maker.subtitle') }}</p>
        </div>
        
        <div class="tech-row">
          <span 
            v-for="tech in techStack" 
            :key="tech.label"
            class="tech-badge"
          >
            <span class="tech-icon">{{ tech.icon }}</span>
            <span class="tech-label">{{ tech.label }}</span>
          </span>
        </div>
        
        <div class="projects-row">
          <span class="project-tag">🚿 Italian Shower</span>
          <span class="project-tag">💡 Ambilight</span>
          <span class="project-tag">🤖 Domotics</span>
          <span class="project-tag">🖥️ Self-Hosting</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.maker-section {
  background: transparent;
  position: relative;
}

.maker-content {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 3rem;
  pointer-events: none;
}

.maker-panel {
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  max-width: 700px;
  pointer-events: auto;
}

.panel-header {
  text-align: center;
  margin-bottom: 1rem;
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

.tech-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--color-paper-cream);
  transition: all 0.2s ease;
}

.tech-badge:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-copper);
}

.tech-icon {
  font-size: 1rem;
}

.tech-label {
  font-size: 0.8rem;
}

.projects-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-tag {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.25rem 0.6rem;
  background: rgba(184, 115, 51, 0.15);
  border-radius: 4px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .maker-panel {
    margin: 0 1rem;
    padding: 1.25rem 1.5rem;
  }
}
</style>
