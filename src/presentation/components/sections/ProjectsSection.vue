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

const openGithubProfile = () => {
  window.open(resumeData.github.url, '_blank', 'noopener,noreferrer')
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
    <div class="section-content projects-content">
      <div class="projects-header">
        <h2 class="section-title">{{ t('projects.title') }}</h2>
        <p class="section-subtitle">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="projects-bottom">
        <div class="projects-grid">
          <div 
            v-for="project in resumeData.projects" 
            :key="project.id"
            class="project-card glass"
            @click="openProject(project.url)"
          >
            <div class="project-icon">{{ project.icon }}</div>
            <div class="project-info">
              <h3 class="project-name">{{ project.name }}</h3>
              <span class="project-tech">{{ project.tech }}</span>
            </div>
            <span class="project-stars">⭐ {{ project.stars }}</span>
          </div>
        </div>

        <!-- GitHub Profile Link -->
        <div class="github-profile glass" @click="openGithubProfile">
          <span class="github-icon">🐙</span>
          <div class="github-info">
            <span class="github-username">@{{ resumeData.github.username }}</span>
            <span class="github-repos">
              <span class="repos-count">{{ resumeData.github.totalRepos }}</span>
              {{ t('projects.repositories') }}
            </span>
          </div>
          <span class="github-arrow">→</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  background: transparent;
}

.projects-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
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

.projects-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  max-width: 700px;
  width: 100%;
}

.project-card {
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(8px);
}

.project-card:hover {
  border-color: var(--color-frontend-blue);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(97, 218, 251, 0.15);
  background: rgba(15, 15, 25, 0.95);
}

.project-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.project-name {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: var(--color-paper-cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-tech {
  font-family: var(--font-code);
  font-size: 0.6rem;
  color: var(--color-terminal-green);
  opacity: 0.8;
}

.project-stars {
  font-size: 0.7rem;
  color: var(--color-growth-yellow);
  flex-shrink: 0;
}

.github-profile {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(8px);
}

.github-profile:hover {
  border-color: var(--color-frontend-blue);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(97, 218, 251, 0.15);
  background: rgba(15, 15, 25, 0.95);
}

.github-icon {
  font-size: 1.4rem;
}

.github-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  text-align: left;
}

.github-username {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--color-paper-cream);
}

.github-repos {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

.repos-count {
  font-family: var(--font-code);
  font-weight: 600;
  color: var(--color-frontend-blue);
}

.github-arrow {
  font-size: 1rem;
  color: var(--color-frontend-blue);
  opacity: 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.github-profile:hover .github-arrow {
  opacity: 1;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 420px;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .projects-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    max-width: 340px;
  }
  
  .project-card {
    padding: 0.5rem 0.6rem;
    gap: 0.4rem;
  }
  
  .project-icon {
    font-size: 1.2rem;
  }
  
  .project-name {
    font-size: 0.7rem;
  }
  
  .project-tech {
    font-size: 0.55rem;
  }
  
  .project-stars {
    font-size: 0.6rem;
  }
  
  .github-profile {
    padding: 0.4rem 0.8rem;
    gap: 0.5rem;
  }
  
  .github-icon {
    font-size: 1.2rem;
  }
  
  .github-username {
    font-size: 0.75rem;
  }
  
  .github-repos {
    font-size: 0.6rem;
  }
  
  .github-arrow {
    opacity: 1;
  }
}
</style>

