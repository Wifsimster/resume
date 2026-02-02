<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { resumeData } from '@domain/data/resume'
import DustCanvas from '@presentation/components/ui/DustCanvas.vue'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="section bg-transparent p-3 sm:p-4 md:p-8 xl:p-12 2xl:p-16" data-section="about">
    <DustCanvas color="#A855F7" color-secondary="#6366F1" />
    <!-- Content -->
    <div class="section-content flex flex-col justify-center items-center h-full">
      <div class="mb-4 text-center w-full">
        <h2 class="text-[var(--color-terminal-green)] mb-2">{{ t('about.title') }}</h2>
        <p class="font-(--font-display) text-3xl text-white/70">{{ t('about.subtitle') }}</p>
      </div>

      <div class="flex flex-col gap-3 w-full max-w-[600px] xl:max-w-[800px] 2xl:max-w-[1000px]">
        <!-- Behaviors -->
        <div v-if="resumeData.behaviors && resumeData.behaviors.length > 0" class="space-y-3">
          <div class="flex flex-wrap gap-2 justify-center">
            <div v-for="behavior in resumeData.behaviors" :key="behavior.id"
              class="inline-flex items-center gap-1.5 py-1.5 px-2.5 bg-[#0A0A0A]/50 backdrop-blur border rounded-full transition-all duration-150 hover:bg-[#0A0A0A]/70 hover:-translate-y-0.5"
              :style="{
                borderColor: `color-mix(in srgb, ${behavior.color} 40%, transparent)`,
                '--behavior-color': behavior.color
              }" @mouseenter="($event.currentTarget as HTMLElement).style.borderColor = behavior.color"
              @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${behavior.color} 40%, transparent)`">
              <span class="text-sm">{{ behavior.icon }}</span>
              <span class="text-sm text-white/90 font-medium">{{ t(`about.behaviors.${behavior.id}`) }}</span>
            </div>
          </div>
        </div>

        <!-- Strengths and Improvement Areas -->
        <div v-if="(resumeData.strengths && resumeData.strengths.length > 0) || (resumeData.improvementAreas && resumeData.improvementAreas.length > 0)" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Strengths -->
          <div v-if="resumeData.strengths && resumeData.strengths.length > 0" class="space-y-3">
            <h3 class="text-lg font-semibold text-white/90 text-center">{{ t('about.strengths.title') }}</h3>
            <div v-for="strength in resumeData.strengths" :key="strength.id"
              class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg flex items-start gap-3 py-3 px-4 transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30">
              <span class="text-2xl shrink-0 mt-0.5">{{ strength.icon }}</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-white/90 mb-1">{{ t(`about.strengths.${strength.id}.title`) }}</div>
                <p class="text-sm leading-relaxed text-white/70 m-0">{{ t(`about.strengths.${strength.id}.description`) }}</p>
              </div>
            </div>
          </div>

          <!-- Improvement Areas -->
          <div v-if="resumeData.improvementAreas && resumeData.improvementAreas.length > 0" class="space-y-3">
            <h3 class="text-lg font-semibold text-white/90 text-center">{{ t('about.improvementAreas.title') }}</h3>
            <div v-for="area in resumeData.improvementAreas" :key="area.id"
              class="bg-[#0A0A0A]/60 backdrop-blur-md border border-orange-500/15 rounded-lg py-3 px-4 transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-orange-500/30">
              <p class="text-sm leading-relaxed text-white/70 m-0">{{ t(`about.improvementAreas.${area.id}`) }}</p>
            </div>
          </div>
        </div>

        <!-- Footnote -->
        <div class="text-center mt-4">
          <p class="text-xs text-white/50">
            {{ t('about.footnote.prefix') }}
            <a href="https://my.assessfirst.com/" target="_blank" rel="noopener noreferrer" 
              class="text-white/70 hover:text-white underline transition-colors">
              {{ t('about.footnote.link') }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
