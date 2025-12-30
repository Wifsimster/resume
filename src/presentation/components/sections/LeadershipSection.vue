<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import LeadershipScene from '@presentation/components/three/scenes/LeadershipScene.vue'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()

const teamStats = [
  { key: 'recruited', value: '2', icon: '👥' },
  { key: 'interns', value: '3', icon: '🎓' },
  { key: 'apprentices', value: '1', icon: '📚' }
]

const rituals = [
  { key: 'monthlyPresentations', icon: '🎤' },
  { key: 'architectureMeetings', icon: '🏗️' },
  { key: 'dailyMeeting', icon: '☀️' }
]

const conferences = [
  { badge: 'Speaker', name: 'Hexagone Tour 2024', type: 'speaker' },
  { badge: 'Attendee', name: 'BDX I/O 2023-25', type: 'attendee' },
  { badge: 'Attendee', name: 'DevQuest 2024', type: 'attendee' }
]
</script>

<template>
  <section id="leadership" class="section bg-transparent" data-section="leadership">
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
        <h2 class="text-(--color-team-orange) mb-2">{{ t('leadership.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('leadership.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px] xl:max-w-[1100px] 2xl:max-w-[1300px] w-full">
        <!-- Team Building Card -->
        <div class="glass p-5 flex flex-col gap-4">
          <h3 class="font-(--font-display) text-lg text-(--color-team-orange) pb-2 border-b border-orange-500/20">{{ t('leadership.mentoring') }}</h3>
          <div class="flex flex-col gap-2.5">
            <div 
              v-for="stat in teamStats" 
              :key="stat.key"
              class="flex items-center gap-3 py-2.5 px-3 bg-black/15 rounded-md transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
            >
              <span class="text-xl">{{ stat.icon }}</span>
              <div class="flex-1">
                <span class="text-sm text-white/80">{{ t(`leadership.${stat.key}`) }}</span>
              </div>
              <span class="font-(--font-display) text-xl font-bold text-(--color-team-orange)">{{ stat.value }}</span>
            </div>
          </div>
        </div>

        <!-- Rituals Card -->
        <div class="glass p-5 flex flex-col gap-4">
          <h3 class="font-(--font-display) text-lg text-(--color-terminal-green) pb-2 border-b border-green-500/20">{{ t('leadership.presentations') }}</h3>
          <div class="flex flex-col gap-2.5">
            <div 
              v-for="ritual in rituals" 
              :key="ritual.key"
              class="flex items-center gap-3 py-2.5 px-3 bg-black/15 rounded-md transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
            >
              <span class="text-xl">{{ ritual.icon }}</span>
              <span class="text-sm text-white/80 flex-1">{{ t(`leadership.${ritual.key}`) }}</span>
            </div>
          </div>
        </div>

        <!-- Conferences Card -->
        <div class="glass p-5 flex flex-col gap-4">
          <h3 class="font-(--font-display) text-lg text-(--color-frontend-blue) pb-2 border-b border-blue-500/20">{{ t('leadership.conferences') }}</h3>
          <div class="flex flex-col gap-2.5">
            <div 
              v-for="conf in conferences" 
              :key="conf.name"
              class="flex items-center gap-2.5 py-2.5 px-3 bg-black/15 rounded-md transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
            >
              <span 
                class="text-[0.6rem] py-0.5 px-2 rounded uppercase font-bold tracking-wide font-(--font-code) text-white shrink-0"
                :class="conf.type === 'speaker' ? 'bg-(--color-team-orange)' : 'bg-(--color-terminal-green)'"
              >{{ conf.badge }}</span>
              <span class="text-sm text-(--color-paper-cream)">{{ conf.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

