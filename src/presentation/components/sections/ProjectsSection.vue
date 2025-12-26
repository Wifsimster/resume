<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import ProjectsScene from '@presentation/components/three/scenes/ProjectsScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()

const openProject = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <section class="section projects-section" data-section="projects">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <ProjectsScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="projects-header">
        <h2 class="section-title">{{ t('projects.title') }}</h2>
        <p class="section-subtitle">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="projects-grid">
        <div 
          v-for="project in resumeData.projects" 
          :key="project.id"
          class="project-card glass"
          @click="openProject(project.url)"
        >
          <div class="project-icon">{{ project.icon }}</div>
          <div class="project-content">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-desc">{{ t(`projects.${project.id}.desc`) }}</p>
            <div class="project-meta">
              <span class="project-tech">{{ project.tech }}</span>
              <span class="project-stars">
                ⭐ {{ project.stars }} {{ t('projects.stars') }}
              </span>
            </div>
          </div>
          <div class="project-link">
            {{ t('projects.viewOnGithub') }} →
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  background: linear-gradient(180deg, #050505 0%, #0A0A14 50%, #050505 100%);
}

.projects-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-frontend-blue);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.project-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.project-card:hover {
  border-color: var(--color-frontend-blue);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.1);
}

.project-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.project-content {
  flex: 1;
}

.project-name {
  font-family: var(--font-code);
  font-size: 1.1rem;
  color: var(--color-paper-cream);
  margin-bottom: 0.5rem;
}

.project-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-tech {
  font-family: var(--font-code);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-terminal-bg);
  color: var(--color-terminal-green);
  border-radius: 4px;
}

.project-stars {
  font-size: 0.85rem;
  color: var(--color-growth-yellow);
}

.project-link {
  font-size: 0.85rem;
  color: var(--color-frontend-blue);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.project-card:hover .project-link {
  opacity: 1;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>

