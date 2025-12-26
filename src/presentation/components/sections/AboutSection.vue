<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import AboutScene from '@presentation/components/three/scenes/AboutScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'
import { computed } from 'vue'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()

const statistics = computed(() => resumeData.statistics || {
  yearsOfExperience: 0,
  totalProjects: 0,
  developersRecruited: 0
})
</script>

<template>
  <section class="section bg-transparent" data-section="about">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true" :dpr="renderSettings.dpr" :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference">
        <AboutScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content flex flex-col justify-center items-center h-full">
      <div class="mb-4 text-center w-full">
        <h2 class="text-(--color-terminal-green) mb-2">{{ t('about.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('about.subtitle') }}</p>
      </div>

      <div class="flex flex-col gap-3 w-full max-w-[600px]">
        <!-- Passions -->
        <div class="flex flex-wrap gap-2 justify-center">
          <div v-for="passion in resumeData.passions" :key="passion.id"
            class="inline-flex items-center gap-1.5 py-1.5 px-2.5 bg-[#0A0A0A]/50 backdrop-blur border rounded-full transition-all duration-150 hover:bg-[#0A0A0A]/70 hover:-translate-y-0.5"
            :style="{
              borderColor: `color-mix(in srgb, ${passion.color} 40%, transparent)`,
              '--passion-color': passion.color
            }" @mouseenter="($event.currentTarget as HTMLElement).style.borderColor = passion.color"
            @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${passion.color} 40%, transparent)`">
            <span class="text-sm">{{ passion.icon }}</span>
            <span class="text-xs text-white/90 font-medium">{{ t(`about.passions.${passion.id}`) }}</span>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          <div
            class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg py-3 px-3 flex flex-col items-center justify-center transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30">
            <div class="text-2xl mb-1">💼</div>
            <div class="text-lg font-bold text-white">{{ statistics.yearsOfExperience }}+</div>
            <div class="text-xs text-white/70 text-center">{{ t('about.stats.yearsExperience') }}</div>
          </div>
          <div
            class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg py-3 px-3 flex flex-col items-center justify-center transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30">
            <div class="text-2xl mb-1">👥</div>
            <div class="text-lg font-bold text-white">{{ statistics.developersRecruited }}</div>
            <div class="text-xs text-white/70 text-center">{{ t('about.stats.developers') }}</div>
          </div>
          <div
            class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg py-3 px-3 flex flex-col items-center justify-center transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30">
            <div class="text-2xl mb-1">🚀</div>
            <div class="text-lg font-bold text-white">{{ statistics.totalProjects }}</div>
            <div class="text-xs text-white/70 text-center">{{ t('about.stats.projects') }}</div>
          </div>
        </div>

        <!-- Hobby inline -->
        <div
          class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg flex items-center gap-3 py-2.5 px-4">
          <span class="text-2xl shrink-0">🛠️</span>
          <p class="text-sm leading-relaxed text-white/80 m-0">{{ t('about.gaming') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
