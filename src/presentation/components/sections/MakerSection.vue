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
        <MakerScene 
          :quality="quality" 
          :projects="projects"
          :tech-stack="techStack"
          :title="t('maker.title')"
          :subtitle="t('maker.subtitle')"
          @hover-unit="handleHoverUnit" 
        />
      </TresCanvas>
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
