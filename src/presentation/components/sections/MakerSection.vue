<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MakerScene from '@presentation/components/three/scenes/MakerScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
const { unlock } = useAchievements()

// Real DIY projects from brag documents
const projects = [
  { icon: '🏠', label: 'Cabane sur pilotis', year: '2023' },
  { icon: '🔥', label: 'Poêle à bois & conduit', year: '2023' },
  { icon: '🤖', label: 'Domotique Home Assistant', year: '2023' },
  { icon: '🚿', label: 'Salle d\'eau & douche italienne', year: '2024' },
  { icon: '🛠️', label: 'Rénovation cellier & bureau', year: '2025' }
]

// Tech stack used
const techStack = [
  { icon: '🍓', label: 'Raspberry Pi' },
  { icon: '🏠', label: 'Home Assistant' },
  { icon: '🔌', label: 'ESP8266 / Arduino' },
  { icon: '📡', label: 'Ubiquiti Network' },
  { icon: '💾', label: 'Unraid NAS' },
  { icon: '🖥️', label: 'Self-Hosting' }
]

// Unlock maker fan achievement when section becomes visible
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          unlock('makerFan')
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )
  
  const section = document.querySelector('[data-section="maker"]')
  if (section) {
    observer.observe(section)
  }
})
</script>

<template>
  <section id="maker" class="section bg-transparent relative" data-section="maker">
    <!-- 3D Canvas - Full background -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
      >
        <MakerScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Compact Content Overlay -->
    <div class="section-content flex items-end justify-center pb-12 pointer-events-none">
      <div class="bg-[#0A0A0A]/75 backdrop-blur-md border border-white/8 rounded-2xl py-6 px-8 max-w-[700px] xl:max-w-[900px] 2xl:max-w-[1100px] pointer-events-auto md:mx-4 md:py-5 md:px-6">
        <div class="text-center mb-4">
          <h2 class="text-(--color-copper) mb-2">{{ t('maker.title') }}</h2>
          <p class="font-(--font-display) text-2xl text-white/70">{{ t('maker.subtitle') }}</p>
        </div>
        
        <!-- Real DIY Projects -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="project in projects" 
            :key="project.label"
            class="inline-flex items-center gap-1.5 py-2 px-3 bg-[#B87333]/15 border border-[#B87333]/30 rounded-lg text-sm text-(--color-paper-cream) transition-all duration-200 hover:bg-[#B87333]/25 hover:border-[#B87333]/50"
          >
            <span class="text-base">{{ project.icon }}</span>
            <span class="text-xs">{{ project.label }}</span>
            <span class="text-[10px] text-white/40 ml-1">{{ project.year }}</span>
          </span>
        </div>
        
        <!-- Tech Stack -->
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tech in techStack" 
            :key="tech.label"
            class="inline-flex items-center gap-1.5 py-1 px-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 transition-all duration-200 hover:bg-white/10"
          >
            <span class="text-sm">{{ tech.icon }}</span>
            <span>{{ tech.label }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
