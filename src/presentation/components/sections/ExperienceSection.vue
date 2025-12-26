<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import ExperienceScene from '@presentation/components/three/scenes/ExperienceScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()
</script>

<template>
  <section class="section bg-transparent" data-section="experience">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <ExperienceScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="text-center mb-12">
        <h2 class="text-(--color-terminal-green) mb-2">{{ t('experience.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('experience.subtitle') }}</p>
      </div>

      <div class="max-w-[800px] mx-auto">
        <div 
          v-for="exp in resumeData.experiences" 
          :key="exp.id"
          class="glass flex flex-col md:flex-row gap-4 md:gap-6 p-4 sm:p-6 mb-4 sm:mb-6 relative"
          :class="exp.current ? 'border-(--color-terminal-green) shadow-[var(--shadow-glow-green)]' : ''"
        >
          <div class="flex flex-row md:flex-col items-center shrink-0 gap-2">
            <div 
              class="w-4 h-4 rounded-full bg-(--color-terminal-green) shadow-[0_0_10px_var(--color-terminal-green)]"
              :class="exp.current ? 'animate-pulse-glow' : ''"
            />
            <div class="flex-1 h-0.5 md:h-auto md:w-0.5 bg-gradient-to-r md:bg-gradient-to-b from-(--color-terminal-green) to-transparent md:mt-2" />
          </div>
          
          <div class="flex-1">
            <div class="flex flex-wrap justify-between items-start mb-2 gap-2">
              <div class="flex items-center gap-3">
                <span class="font-(--font-code) text-sm text-(--color-vue-green)">{{ exp.company }}</span>
                <span v-if="exp.current" class="text-[0.7rem] py-0.5 px-2 bg-(--color-terminal-green) text-(--color-wood-dark) rounded uppercase font-semibold">{{ t('experience.current') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-(--font-code) text-sm text-white/50">{{ exp.period }}</span>
                <span class="font-(--font-code) text-xs text-(--color-terminal-green)/70">· {{ exp.duration }}</span>
              </div>
            </div>
            
            <h3 class="font-(--font-display) text-[1.75rem] sm:text-[1.4rem] text-(--color-paper-cream) mb-2">{{ t(`experience.${exp.id}.title`) }}</h3>
            <p class="text-white/70 mb-4 leading-relaxed sm:text-sm">{{ t(`experience.${exp.id}.description`) }}</p>
            
            <div>
              <h4 class="font-(--font-code) text-xs text-(--color-terminal-green) uppercase tracking-widest mb-2">{{ t('experience.achievements') }}</h4>
              <ul class="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                <li 
                  v-for="(achievement, index) in exp.achievements" 
                  :key="index"
                  class="flex items-start gap-2 text-sm sm:text-[0.85rem] text-white/80"
                >
                  <span class="text-(--color-terminal-green) font-bold">✓</span>
                  {{ achievement }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

