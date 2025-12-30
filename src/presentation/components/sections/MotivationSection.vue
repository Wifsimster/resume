<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MotivationScene from '@presentation/components/three/scenes/MotivationScene.vue'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
</script>

<template>
  <section id="motivation" class="section bg-transparent p-3 sm:p-4 md:p-8 xl:p-12 2xl:p-16" data-section="motivation">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true" :dpr="renderSettings.dpr" :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference">
        <MotivationScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content flex flex-col justify-center items-center h-full">
      <div class="mb-4 text-center w-full">
        <h2 class="text-[var(--color-terminal-green)] mb-2">{{ t('motivation.title') }}</h2>
        <p class="font-(--font-display) text-3xl text-white/70">{{ t('motivation.subtitle') }}</p>
      </div>

      <div class="flex flex-col gap-4 w-full max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px]">
        <!-- Ideal Environment -->
        <div class="space-y-3">
          <div class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg flex items-start gap-3 py-4 px-5 transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
            <span class="text-2xl shrink-0 mt-0.5">🌱</span>
            <p class="text-sm leading-relaxed text-white/70 m-0 flex-1">{{ t('motivation.culture.idealEnvironment.description') }}</p>
          </div>
        </div>

        <!-- Management Styles -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- My Management Style -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-white/90 text-center mb-1">{{ t('motivation.managementStyle.adopts.title') }}</h3>
            <div class="bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg flex items-start gap-3 py-4 px-5 transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
              <span class="text-2xl shrink-0 mt-0.5">👁️</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-white/90 mb-2">{{ t('motivation.managementStyle.adopts.implication.title') }}</div>
                <p class="text-sm leading-relaxed text-white/70 m-0">{{ t('motivation.managementStyle.adopts.implication.description') }}</p>
              </div>
            </div>
          </div>

          <!-- Management Style I Seek -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-white/90 text-center mb-1">{{ t('motivation.managementStyle.seeks.title') }}</h3>
            <div class="bg-[#0A0A0A]/60 backdrop-blur-md border border-orange-500/15 rounded-lg flex items-start gap-3 py-4 px-5 transition-all duration-150 hover:bg-[#0A0A0A]/80 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10">
              <span class="text-2xl shrink-0 mt-0.5">🎯</span>
              <p class="text-sm leading-relaxed text-white/70 m-0 flex-1">{{ t('motivation.managementStyle.seeks.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

