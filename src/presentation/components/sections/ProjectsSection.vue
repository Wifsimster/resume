<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAchievements } from '@application/composables/useAchievements'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { unlock } = useAchievements()

// Cards are real <a> links now (keyboard + middle-click support); the click
// handler only tracks the achievement, navigation is native.
const trackProject = (url: string) => {
  if (url.includes('github.com')) {
    unlock('githubVisitor')
  }
}

const trackGithubProfile = () => {
  unlock('githubVisitor')
}
</script>

<template>
  <section id="projects" class="section bg-transparent section-padding" data-section="projects">
    <!-- Content -->
    <div class="section-content flex flex-col items-center justify-center pointer-events-none">
      <div class="section-header reveal">
        <h2 class="text-[var(--color-frontend-blue)] mb-2">{{ t('projects.title') }}</h2>
        <p class="section-subtitle">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="flex flex-col items-center gap-4 w-full px-4 sm:px-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[420px] sm:max-w-[680px] lg:max-w-[880px]">
          <!-- Blog Card -->
          <a
            v-for="(project, pIndex) in resumeData.projects"
            :key="project.id"
            :href="project.url"
            target="_blank"
            rel="noopener noreferrer"
            class="glass reveal flex flex-col gap-2 p-4 lg:p-5 cursor-pointer transition-[border-color,transform,box-shadow,background-color] duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur no-underline hover:border-[var(--color-frontend-blue)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-indigo)] hover:bg-[#0F0F19]/95 active:translate-y-0 active:scale-[0.99]"
            :style="{ '--reveal-i': pIndex }"
            @click="trackProject(project.url)"
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
            <p class="text-sm text-white/60 leading-relaxed">{{ t(`projects.${project.id}.desc`) }}</p>
          </a>

          <!-- GitHub Open Source Projects Card -->
          <a
            :href="resumeData.github.url"
            target="_blank"
            rel="noopener noreferrer"
            class="glass reveal flex flex-col gap-2 p-4 lg:p-5 cursor-pointer transition-[border-color,transform,box-shadow,background-color] duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur no-underline hover:border-[var(--color-frontend-blue)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-indigo)] hover:bg-[#0F0F19]/95 active:translate-y-0 active:scale-[0.99] group"
            :style="{ '--reveal-i': resumeData.projects.length }"
            @click="trackGithubProfile"
          >
            <!-- Header: Icon + Title -->
            <div class="flex items-center gap-2">
              <span class="text-base shrink-0">🐙</span>
              <span class="font-(--font-code) text-sm text-[var(--color-paper-cream)] flex-1">{{ t('projects.github.title') }}</span>
            </div>
            
            <!-- Tech tag -->
            <span class="font-(--font-code) text-xs text-[var(--color-terminal-green)]/80">{{ t('projects.github.tech') }}</span>
            
            <!-- Description -->
            <p class="text-sm text-white/60 leading-relaxed">{{ t('projects.github.desc', { count: resumeData.github.totalRepos }) }}</p>

            <!-- Footer: Username + Arrow -->
            <div class="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
              <span class="font-(--font-code) text-xs text-[var(--color-paper-cream)]">@{{ resumeData.github.username }}</span>
              <span class="text-sm text-[var(--color-frontend-blue)] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-[opacity,transform] duration-150">→</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

