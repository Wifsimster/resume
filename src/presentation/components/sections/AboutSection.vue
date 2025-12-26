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
    <div class="section-content about-content">
      <div class="about-header">
        <h2 class="section-title">{{ t('about.title') }}</h2>
        <p class="section-subtitle">{{ t('about.subtitle') }}</p>
      </div>

      <div class="about-compact">
        <!-- Bio -->
        <div class="about-card glass-subtle">
          <p class="bio">{{ t('about.intro') }}</p>
        </div>

        <!-- Passions -->
        <div class="passions-inline">
          <div 
            v-for="passion in resumeData.passions" 
            :key="passion.id"
            class="passion-tag"
            :style="{ '--passion-color': passion.color }"
          >
            <span class="passion-icon">{{ passion.icon }}</span>
            <span class="passion-name">{{ t(`about.passions.${passion.id}`) }}</span>
          </div>
        </div>

        <!-- Hobby inline -->
        <div class="hobby-inline glass-subtle">
          <span class="hobby-icon">🛠️</span>
          <p>{{ t('about.gaming') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background: transparent;
}

.about-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;
  padding-bottom: 3rem;
}

.about-header {
  margin-bottom: 1rem;
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

.glass-subtle {
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 8px;
}

.about-compact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
}

.about-card {
  padding: 0.75rem 1rem;
}

.bio {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.passions-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.passion-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--passion-color) 40%, transparent);
  transition: all var(--transition-fast);
}

.passion-tag:hover {
  background: rgba(10, 10, 10, 0.7);
  border-color: var(--passion-color);
  transform: translateY(-2px);
}

.passion-icon {
  font-size: 0.9rem;
}

.passion-name {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.hobby-inline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
}

.hobby-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.hobby-inline p {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@media (max-width: 768px) {
  .about-content {
    padding-bottom: 2rem;
    align-items: center;
  }
  
  .about-compact {
    max-width: 100%;
  }
  
  .about-header {
    text-align: center;
    width: 100%;
  }
  
  .passions-inline {
    justify-content: center;
  }
}
</style>

