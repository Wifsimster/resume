<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MakerScene from '@presentation/components/three/scenes/MakerScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
const { unlock } = useAchievements()

// Tooltip state
const hoveredUnitId = ref<string | null>(null)
const mousePosition = ref({ x: 0, y: 0 })

// Handle hover events from MakerScene
const handleHoverUnit = (unitId: string | null) => {
  hoveredUnitId.value = unitId
}

// Track mouse position for tooltip
const handleMouseMove = (event: MouseEvent) => {
  mousePosition.value = { x: event.clientX, y: event.clientY }
}

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
  
  // Add mouse move listener for tooltip positioning
  window.addEventListener('mousemove', handleMouseMove)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <section id="maker" class="section bg-transparent relative p-3 sm:p-4 md:p-8 xl:p-12 2xl:p-16" data-section="maker">
    <!-- 3D Canvas - Full background -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
      >
        <MakerScene :quality="quality" @hover-unit="handleHoverUnit" />
      </TresCanvas>
    </div>

    <!-- Compact Content Overlay -->
    <div class="section-content flex items-end justify-start pb-12 pointer-events-none pl-4 md:pl-8 xl:pl-12">
      <div class="bg-[#0A0A0A]/75 backdrop-blur-md border border-white/8 rounded-2xl py-6 px-8 max-w-[500px] xl:max-w-[600px] 2xl:max-w-[700px] pointer-events-auto md:py-5 md:px-6">
        <div class="text-center mb-4">
          <h2 class="text-[var(--color-copper)] mb-2">{{ t('maker.title') }}</h2>
          <p class="font-(--font-display) text-2xl text-white/70">{{ t('maker.subtitle') }}</p>
        </div>
        
        <!-- Real DIY Projects -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="project in projects" 
            :key="project.label"
            class="inline-flex items-center gap-1.5 py-2 px-3 bg-[#B87333]/15 border border-[#B87333]/30 rounded-lg text-sm text-[var(--color-paper-cream)] transition-all duration-200 hover:bg-[#B87333]/25 hover:border-[#B87333]/50"
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
    
    <!-- Tooltip for server rack units -->
    <div
      v-if="hoveredUnitId"
      class="fixed z-50 pointer-events-none transition-opacity duration-200"
      :style="{
        left: `${mousePosition.x + 15}px`,
        top: `${mousePosition.y - 10}px`,
        transform: 'translateY(-50%)'
      }"
    >
      <div class="bg-[#0A0A0A]/95 backdrop-blur-md border border-[#B87333]/50 rounded-lg px-4 py-3 shadow-xl max-w-xs">
        <h3 class="text-[var(--color-copper)] font-semibold mb-1 text-sm">
          {{ t(`maker.rackUnits.${hoveredUnitId}.name`) }}
        </h3>
        <p class="text-white/70 text-xs leading-relaxed">
          {{ t(`maker.rackUnits.${hoveredUnitId}.description`) }}
        </p>
      </div>
    </div>
  </section>
</template>
