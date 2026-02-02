<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resumeData } from '@domain/data/resume'
import DustCanvas from '@presentation/components/ui/DustCanvas.vue'
import HackOverlay from '@presentation/components/ui/HackOverlay.vue'

const { t } = useI18n()

// Group skills by category, preserving the intentional order from the data file
// The order groups related items together (e.g., DevOps tools, then Testing, then IDE/AI tools)
const skillsByCategory = computed(() => {
  const categories = ['soft', 'ia', 'hardskills'] as const
  return categories.map(cat => ({
    id: cat,
    name: t(`skills.${cat}`),
    skills: resumeData.skills.filter(s => s.category === cat) // filter preserves order
  }))
})
</script>

<template>
  <section id="skills" class="section bg-transparent p-3 sm:p-4 md:p-8 xl:p-12 2xl:p-16" data-section="skills">
    <DustCanvas color="#FBBF24" color-secondary="#42B883" />
    <HackOverlay />
    <!-- Content -->
    <div class="section-content">
      <div class="text-center mb-8">
        <h2 class="text-[var(--color-growth-yellow)] mb-2">{{ t('skills.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('skills.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[800px] xl:max-w-[900px] 2xl:max-w-[1000px] mx-auto justify-items-center lg:justify-items-stretch">
        <div 
          v-for="category in skillsByCategory" 
          :key="category.id"
          class="glass p-3 w-full max-w-[230px] sm:max-w-none lg:w-full flex flex-col"
        >
          <h3 class="font-(--font-display) text-sm text-[var(--color-terminal-green)] mb-1.5 pb-0.5 border-b border-green-500/20">{{ category.name }}</h3>
          
          <div class="flex flex-col gap-1.5 flex-1">
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
              <img v-if="skill.logo" :src="skill.logo" :alt="skill.name" class="w-5 h-5 rounded-sm" />
              <span v-else-if="skill.icon" class="text-lg">{{ skill.icon }}</span>
              <span class="text-sm text-[var(--color-paper-cream)]">{{ skill.name }}</span>
              <span v-if="skill.url" class="ml-auto text-white/30 text-xs">↗</span>
            </component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

