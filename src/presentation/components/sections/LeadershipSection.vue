<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import LeadershipScene from '@presentation/components/three/scenes/LeadershipScene.vue'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { quality } = useQuality()

const stats = [
  { key: 'recruited', value: '2', icon: '👥' },
  { key: 'interns', value: '3', icon: '🎓' },
  { key: 'apprentices', value: '1', icon: '📚' },
  { key: 'monthlyPresentations', value: '1', icon: '🎤' },
  { key: 'architectureMeetings', value: '1', icon: '🏗️' }
]

const conferences = [
  { badge: 'Speaker', name: 'Hexagone Tour 2024', type: 'speaker' },
  { badge: 'Attendee', name: 'BDX I/O 2023-25', type: 'attendee' },
  { badge: 'Attendee', name: 'DevQuest 2024', type: 'attendee' }
]
</script>

<template>
  <section class="section bg-transparent" data-section="leadership">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <LeadershipScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content - positioned to the left -->
    <div class="section-content flex items-center justify-start lg:justify-center pl-8 lg:pl-0">
      <div class="glass max-w-[420px] lg:max-w-full lg:w-full p-6 sm:p-4 flex flex-col gap-5 sm:gap-4 border-l-3 border-l-(--color-team-orange) bg-[#0A0A0A]/75">
        <!-- Header -->
        <div class="text-left">
          <h2 class="text-(--color-team-orange) mb-2">{{ t('leadership.title') }}</h2>
          <p class="font-(--font-display) text-2xl text-white/70">{{ t('leadership.subtitle') }}</p>
        </div>

        <!-- Stats Row -->
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="stat in stats" 
            :key="stat.key"
            class="flex items-center gap-1.5 py-1.5 px-2.5 sm:py-1 sm:px-2 bg-orange-500/10 border border-orange-500/25 rounded-md transition-all duration-150 hover:bg-orange-500/20 hover:border-orange-500/40 hover:-translate-y-0.5"
          >
            <span class="text-base">{{ stat.icon }}</span>
            <span class="font-(--font-display) text-lg font-bold text-(--color-team-orange)">{{ stat.value }}</span>
            <span class="text-[0.7rem] sm:text-[0.65rem] text-white/70 max-w-[70px] sm:max-w-[60px] leading-tight">{{ t(`leadership.${stat.key}`) }}</span>
          </div>
        </div>

        <!-- Conferences -->
        <div class="flex flex-col gap-2.5">
          <h3 class="font-(--font-display) text-sm text-(--color-terminal-green) uppercase tracking-wide m-0">{{ t('leadership.conferences') }}</h3>
          <div class="flex flex-col gap-1.5">
            <div 
              v-for="conf in conferences" 
              :key="conf.name"
              class="flex items-center gap-2.5 py-2 px-3 sm:py-1.5 sm:px-2.5 bg-black/25 rounded-md border border-purple-500/15 transition-all duration-150 hover:bg-black/40 hover:translate-x-1"
              :class="conf.type === 'speaker' ? 'border-l-2 border-l-(--color-team-orange)' : 'border-l-2 border-l-(--color-terminal-green)'"
            >
              <span 
                class="text-[0.6rem] py-0.5 px-2 rounded uppercase font-bold tracking-wide font-(--font-code) text-white"
                :class="conf.type === 'speaker' ? 'bg-(--color-team-orange)' : 'bg-(--color-terminal-green)'"
              >{{ conf.badge }}</span>
              <span class="text-sm sm:text-xs text-(--color-paper-cream) font-medium">{{ conf.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

