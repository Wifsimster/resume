<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import LeadershipScene from '@presentation/components/three/scenes/LeadershipScene.vue'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
</script>

<template>
  <section id="motivation" class="section bg-transparent p-3 sm:p-4 md:p-8 xl:p-12 2xl:p-16" data-section="motivation">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
      >
        <LeadershipScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content flex flex-col items-center justify-start h-full pt-6 md:pt-8">
      <div class="text-center mb-6">
        <h2 class="text-[var(--color-growth-yellow)] mb-2">{{ t('motivation.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70 max-w-3xl mx-auto">{{ t('motivation.culture.idealEnvironment.description') }}</p>
      </div>

      <div class="w-full max-w-[900px] xl:max-w-[1100px] 2xl:max-w-[1300px] flex flex-col gap-4">
        <!-- Management Styles - Two Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Management Style Adopts -->
          <div class="glass p-4 flex flex-col gap-2">
            <h3 class="font-(--font-display) text-sm text-[var(--color-accent-primary)] pb-1.5 border-b border-purple-500/20">{{ t('motivation.managementStyle.adopts.title') }}</h3>
            <p class="text-sm text-white/70 leading-relaxed">{{ t('motivation.managementStyle.adopts.implication.description') }}</p>
          </div>

          <!-- Management Style Seeks -->
          <div class="glass p-4 flex flex-col gap-2">
            <h3 class="font-(--font-display) text-sm text-[var(--color-accent-primary)] pb-1.5 border-b border-purple-500/20">{{ t('motivation.managementStyle.seeks.title') }}</h3>
            <p class="text-sm text-white/70 leading-relaxed">{{ t('motivation.managementStyle.seeks.description') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

