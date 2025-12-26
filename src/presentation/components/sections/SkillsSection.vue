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
  <section class="section bg-transparent" data-section="skills">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <SkillsScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="text-center mb-12">
        <h2 class="text-(--color-growth-yellow) mb-2">{{ t('skills.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('skills.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 max-w-[1200px] mx-auto">
        <div 
          v-for="category in skillsByCategory" 
          :key="category.id"
          class="glass p-5"
        >
          <h3 class="font-(--font-display) text-2xl text-(--color-terminal-green) mb-4 pb-2 border-b border-green-500/20">{{ category.name }}</h3>
          
          <div class="flex flex-col gap-3">
            <component
              :is="skill.url ? 'a' : 'div'"
              v-for="skill in category.skills" 
              :key="skill.id"
              :href="skill.url || undefined"
              :target="skill.url ? '_blank' : undefined"
              :rel="skill.url ? 'noopener noreferrer' : undefined"
              class="flex items-center gap-2 py-2.5 px-3 bg-black/15 rounded-md transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
              :class="{ 'cursor-pointer': skill.url }"
            >
              <span v-if="skill.icon" class="text-xl">{{ skill.icon }}</span>
              <span class="text-[0.95rem] text-(--color-paper-cream)">{{ skill.name }}</span>
              <span v-if="skill.url" class="ml-auto text-white/30 text-xs">↗</span>
            </component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

