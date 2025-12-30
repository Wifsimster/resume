<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import SkillsScene from '@presentation/components/three/scenes/SkillsScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()

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
  <section id="skills" class="section bg-transparent" data-section="skills">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
      >
        <SkillsScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="text-center mb-8">
        <h2 class="text-(--color-growth-yellow) mb-2">{{ t('skills.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('skills.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div 
          v-for="category in skillsByCategory" 
          :key="category.id"
          class="glass p-3"
        >
          <h3 class="font-(--font-display) text-xs text-(--color-terminal-green) mb-1.5 pb-0.5 border-b border-green-500/20">{{ category.name }}</h3>
          
          <div class="flex flex-col gap-1.5">
            <component
              :is="skill.url ? 'a' : 'div'"
              v-for="skill in category.skills" 
              :key="skill.id"
              :href="skill.url || undefined"
              :target="skill.url ? '_blank' : undefined"
              :rel="skill.url ? 'noopener noreferrer' : undefined"
              class="flex items-center gap-2 py-1.5 px-2.5 bg-black/15 rounded-md transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
              :class="{ 'cursor-pointer': skill.url }"
            >
              <span v-if="skill.icon" class="text-lg">{{ skill.icon }}</span>
              <span class="text-[0.875rem] text-(--color-paper-cream)">{{ skill.name }}</span>
              <span v-if="skill.url" class="ml-auto text-white/30 text-xs">↗</span>
            </component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

