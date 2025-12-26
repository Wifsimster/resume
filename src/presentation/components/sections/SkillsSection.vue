<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import SkillsScene from '@presentation/components/three/scenes/SkillsScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()

// Group skills by category
const skillsByCategory = computed(() => {
  const categories = ['frontend', 'backend', 'devops', 'soft'] as const
  return categories.map(cat => ({
    id: cat,
    name: t(`skills.${cat}`),
    skills: resumeData.skills.filter(s => s.category === cat)
  }))
})
</script>

<template>
  <section class="section skills-section" data-section="skills">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <SkillsScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="skills-header">
        <h2 class="section-title">{{ t('skills.title') }}</h2>
        <p class="section-subtitle">{{ t('skills.subtitle') }}</p>
      </div>

      <div class="skills-grid">
        <div 
          v-for="category in skillsByCategory" 
          :key="category.id"
          class="skill-category glass"
        >
          <h3 class="category-name">{{ category.name }}</h3>
          
          <div class="skills-list">
            <div 
              v-for="skill in category.skills" 
              :key="skill.id"
              class="skill-item"
            >
              <span v-if="skill.icon" class="skill-icon">{{ skill.icon }}</span>
              <span class="skill-name">{{ skill.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  background: transparent;
}

.skills-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-growth-yellow);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.skill-category {
  padding: 1.25rem;
}

.category-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-terminal-green);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.skill-item:hover {
  background: rgba(0, 0, 0, 0.25);
  transform: translateX(4px);
}

.skill-icon {
  font-size: 1.25rem;
}

.skill-name {
  font-size: 0.95rem;
  color: var(--color-paper-cream);
}

@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
}
</style>

