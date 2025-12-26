<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import ProjectsScene from '@presentation/components/three/scenes/ProjectsScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()
const { unlock } = useAchievements()

const openProject = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
  unlock('githubVisitor')
}

const openGithubProfile = () => {
  window.open(resumeData.github.url, '_blank', 'noopener,noreferrer')
  unlock('githubVisitor')
}
</script>

<template>
  <section class="section bg-transparent" data-section="projects">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <ProjectsScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content flex flex-col items-center justify-between pointer-events-none">
      <div class="text-center mb-12">
        <h2 class="text-(--color-frontend-blue) mb-2 md:text-[1.75rem]">{{ t('projects.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="flex flex-col items-center gap-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-2 w-full max-w-[700px] md:max-w-[420px] sm:max-w-[340px]">
          <div 
            v-for="project in resumeData.projects" 
            :key="project.id"
            class="glass flex items-center gap-2.5 sm:gap-1.5 py-2.5 px-3 sm:py-2 sm:px-2.5 cursor-pointer transition-all duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur hover:border-(--color-frontend-blue) hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(97,218,251,0.15)] hover:bg-[#0F0F19]/95"
            @click="openProject(project.url)"
          >
            <div class="text-[1.4rem] sm:text-xl shrink-0">{{ project.icon }}</div>
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <h3 class="font-(--font-code) text-xs sm:text-[0.7rem] text-(--color-paper-cream) whitespace-nowrap overflow-hidden text-ellipsis">{{ project.name }}</h3>
              <span class="font-(--font-code) text-[0.6rem] sm:text-[0.55rem] text-(--color-terminal-green) opacity-80">{{ project.tech }}</span>
            </div>
            <span class="text-[0.7rem] sm:text-[0.6rem] text-(--color-growth-yellow) shrink-0">⭐ {{ project.stars }}</span>
          </div>
        </div>

        <!-- GitHub Profile Link -->
        <div 
          class="glass inline-flex items-center gap-3 sm:gap-2 py-2 px-4 sm:py-1.5 sm:px-3 cursor-pointer transition-all duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur group hover:border-(--color-frontend-blue) hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(97,218,251,0.15)] hover:bg-[#0F0F19]/95"
          @click="openGithubProfile"
        >
          <span class="text-[1.4rem] sm:text-xl">🐙</span>
          <div class="flex flex-col gap-0.5 text-left">
            <span class="font-(--font-code) text-sm sm:text-xs text-(--color-paper-cream)">@{{ resumeData.github.username }}</span>
            <span class="text-[0.7rem] sm:text-[0.6rem] text-white/60">
              <span class="font-(--font-code) font-semibold text-(--color-frontend-blue)">{{ resumeData.github.totalRepos }}</span>
              {{ t('projects.repositories') }}
            </span>
          </div>
          <span class="text-base text-(--color-frontend-blue) opacity-0 sm:opacity-100 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  </section>
</template>

