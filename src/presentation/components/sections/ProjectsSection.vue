<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import ProjectsScene from '@presentation/components/three/scenes/ProjectsScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
const { unlock } = useAchievements()

const openProject = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
  if (url.includes('github.com')) {
    unlock('githubVisitor')
  }
}

const openGithubProfile = () => {
  window.open(resumeData.github.url, '_blank', 'noopener,noreferrer')
  unlock('githubVisitor')
}
</script>

<template>
  <section id="projects" class="section bg-transparent p-3 sm:p-4 md:p-8 xl:p-12 2xl:p-16" data-section="projects">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
      >
        <ProjectsScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content flex flex-col items-center justify-center pointer-events-none">
      <div class="text-center mb-6 sm:mb-8">
        <h2 class="text-[var(--color-frontend-blue)] mb-2 text-6xl sm:text-7xl">{{ t('projects.title') }}</h2>
        <p class="font-(--font-display) text-base sm:text-lg text-white/70">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="flex flex-col items-center gap-4 w-full px-4 sm:px-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[400px] sm:max-w-[640px] lg:max-w-[800px]">
          <!-- Blog Card -->
          <div 
            v-for="project in resumeData.projects" 
            :key="project.id"
            class="glass flex flex-col gap-2 p-3 cursor-pointer transition-all duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur hover:border-[var(--color-frontend-blue)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(97,218,251,0.15)] hover:bg-[#0F0F19]/95"
            @click="openProject(project.url)"
          >
            <!-- Header: Icon + Name -->
            <div class="flex items-center gap-2">
              <span class="text-base shrink-0">{{ project.icon }}</span>
              <span class="font-(--font-code) text-sm text-[var(--color-paper-cream)] flex-1">{{ project.name }}</span>
              <span v-if="project.stars" class="text-xs text-[var(--color-growth-yellow)] shrink-0">⭐ {{ project.stars }}</span>
            </div>
            
            <!-- Tech tag -->
            <span class="font-(--font-code) text-xs text-[var(--color-terminal-green)]/80">{{ project.tech }}</span>
            
            <!-- Description -->
            <p class="text-xs text-white/60 leading-relaxed">{{ t(`projects.${project.id}.desc`) }}</p>
          </div>

          <!-- GitHub Open Source Projects Card -->
          <div 
            class="glass flex flex-col gap-2 p-3 cursor-pointer transition-all duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur hover:border-[var(--color-frontend-blue)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(97,218,251,0.15)] hover:bg-[#0F0F19]/95 group"
            @click="openGithubProfile"
          >
            <!-- Header: Icon + Title -->
            <div class="flex items-center gap-2">
              <span class="text-base shrink-0">🐙</span>
              <span class="font-(--font-code) text-sm text-[var(--color-paper-cream)] flex-1">{{ t('projects.github.title') }}</span>
            </div>
            
            <!-- Tech tag -->
            <span class="font-(--font-code) text-xs text-[var(--color-terminal-green)]/80">{{ t('projects.github.tech') }}</span>
            
            <!-- Description -->
            <p class="text-xs text-white/60 leading-relaxed">{{ t('projects.github.desc', { count: resumeData.github.totalRepos }) }}</p>
            
            <!-- Footer: Username + Arrow -->
            <div class="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
              <span class="font-(--font-code) text-xs text-[var(--color-paper-cream)]">@{{ resumeData.github.username }}</span>
              <span class="text-sm text-[var(--color-frontend-blue)] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

