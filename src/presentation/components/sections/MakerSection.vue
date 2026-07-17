<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MakerScene from '@presentation/components/three/scenes/MakerScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'
import type { CameraMode } from '@application/composables/useMakerCamera'
import RackLegend from '@presentation/components/ui/RackLegend.vue'
import { rackUnits } from '@domain/data/makerRack'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
const { unlock } = useAchievements()

// Tooltip state
const hoveredUnitId = ref<string | null>(null)
const mousePosition = ref({ x: 0, y: 0 })

// MakerScene ref for Tres context (camera/renderer used by RackLegend)
const makerSceneRef = ref<InstanceType<typeof MakerScene> | null>(null)

// Camera mode state - managed here, passed as prop to MakerScene
const cameraMode = ref<CameraMode>('desk')

// Toggle camera mode
const handleToggleCamera = () => {
  cameraMode.value = cameraMode.value === 'desk' ? 'rack' : 'desk'
}

// Check if desk mode is active
const isDeskMode = computed(() => cameraMode.value === 'desk')

// Handle hover events from MakerScene
const handleHoverUnit = (unitId: string | null) => {
  hoveredUnitId.value = unitId
}

// Convert unit ID (with dashes) to translation key (camelCase)
const getTranslationKey = (unitId: string | null): string | null => {
  if (!unitId) return null
  // Convert dash-separated IDs to camelCase for translation keys
  const keyMap: Record<string, string> = {
    'udm-pro': 'udmPro',
    'silver-1u': 'silver1u'
  }
  return keyMap[unitId] || unitId
}

// Track mouse position for tooltip
const handleMouseMove = (event: MouseEvent) => {
  mousePosition.value = { x: event.clientX, y: event.clientY }
}

// Touch devices get a fixed bottom-sheet tooltip instead of cursor-anchored
// (there is no persistent cursor to anchor to).
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

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
  <section id="maker" class="section bg-transparent relative section-padding" data-section="maker">
    <!-- Camera View Toggle Switch -->
    <div class="absolute top-0 left-0 right-0 z-50 section-padding">
      <div class="sticky top-0 flex justify-center">
        <button
          class="flex items-center justify-between w-[90px] h-9 p-0.5 bg-[#1E1E1E]/80 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-200 hover:border-white/20 sm:w-20 sm:h-10"
          @click="handleToggleCamera"
          :aria-label="isDeskMode ? t('maker.cameraViewRack') : t('maker.cameraViewDesk')"
        >
      <span 
        class="flex items-center justify-center w-8 h-8 text-lg rounded-full transition-all duration-200 select-none sm:w-9 sm:h-9 sm:text-xl"
        :class="isDeskMode ? 'opacity-100 bg-white/10' : 'opacity-50'"
        :title="t('maker.cameraViewDesk')"
      >🖥️</span>
      <span 
        class="flex items-center justify-center w-8 h-8 text-lg rounded-full transition-all duration-200 select-none sm:w-9 sm:h-9 sm:text-xl"
        :class="!isDeskMode ? 'opacity-100 bg-white/10' : 'opacity-50'"
        :title="t('maker.cameraViewRack')"
      >🗄️</span>
        </button>
      </div>
    </div>

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
          ref="makerSceneRef"
          :quality="quality"
          :camera-mode="cameraMode"
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
      v-if="hoveredUnitId && getTranslationKey(hoveredUnitId)"
      class="fixed z-50 pointer-events-none transition-opacity duration-200"
      :class="isCoarsePointer ? 'bottom-4 left-4 right-4 flex justify-center' : ''"
      :style="isCoarsePointer ? undefined : {
        left: `${mousePosition.x + 15}px`,
        top: `${mousePosition.y - 10}px`,
        transform: 'translateY(-50%)'
      }"
    >
      <div class="bg-[#0A0A0A]/95 backdrop-blur-md border border-[color-mix(in_srgb,var(--color-copper)_50%,transparent)] rounded-lg px-4 py-3 shadow-xl max-w-xs">
        <h3 class="text-[var(--color-copper)] font-semibold mb-1 text-sm">
          {{ t(`maker.rackUnits.${getTranslationKey(hoveredUnitId)}.name`) }}
        </h3>
        <p class="text-white/70 text-xs leading-relaxed">
          {{ t(`maker.rackUnits.${getTranslationKey(hoveredUnitId)}.description`) }}
        </p>
      </div>
    </div>

    <!-- Rack Legend - Hand-drawn annotations (PERFORMANCE FIXED) -->
    <RackLegend
      :visible="!isDeskMode && !!makerSceneRef"
      :rack-units="rackUnits"
      :camera="makerSceneRef?.camera"
      :renderer="makerSceneRef?.renderer"
    />
  </section>
</template>
