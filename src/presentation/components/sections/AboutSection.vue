<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import AboutScene from '@presentation/components/three/scenes/AboutScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()
</script>

<template>
  <section class="section bg-transparent" data-section="about">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <AboutScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content flex flex-col justify-start items-center md:items-start h-full pt-6 md:pt-8">
      <div class="mb-4 text-center md:text-left w-full md:w-auto">
        <h2 class="text-(--color-terminal-green) mb-2">{{ t('about.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('about.subtitle') }}</p>
      </div>

      <div class="flex flex-col gap-3 w-full md:max-w-[600px]">
        <!-- Bio -->
        <div class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg py-3 px-4">
          <p class="text-sm leading-relaxed text-white/85 m-0">{{ t('about.intro') }}</p>
        </div>

        <!-- Passions -->
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
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
