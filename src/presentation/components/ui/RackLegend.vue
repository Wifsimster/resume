<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTres } from '@tresjs/core'
import { Vector3 } from 'three'
import type { ServerUnit } from '@domain/types/makerRack'

const props = defineProps<{
  visible: boolean
  rackUnits: ServerUnit[]
}>()

const { t } = useI18n()
const { camera, renderer } = useTres()

// Rack position in 3D space (from ServerRackComponent)
const RACK_POSITION = { x: 1.372, y: -1.7735, z: 0.5 }
const UNIT_Z_OFFSET = 0.4

// Screen positions for each unit
const unitScreenPositions = ref<Map<string, { x: number, y: number }>>(new Map())
const canvasRect = ref<DOMRect | null>(null)

// Convert unit ID to translation key
const getTranslationKey = (unitId: string): string => {
  const keyMap: Record<string, string> = {
    'udm-pro': 'udmPro',
    'silver-1u': 'silver1u'
  }
  return keyMap[unitId] || unitId
}

// Calculate 3D world position for a unit
const getUnitWorldPosition = (unit: ServerUnit): Vector3 => {
  // Unit position relative to rack: [0, unit.y, 0.4]
  // Rack position: [1.372, -1.7735, 0.5]
  return new Vector3(
    RACK_POSITION.x,
    RACK_POSITION.y + unit.y,
    RACK_POSITION.z + UNIT_Z_OFFSET
  )
}

// Convert 3D position to 2D screen coordinates
const worldToScreen = (worldPos: Vector3): { x: number, y: number } | null => {
  const cameraInstance = camera.value
  const rendererInstance = (renderer as any).value
  
  if (!cameraInstance || !rendererInstance || !canvasRect.value) return null

  const vector = worldPos.clone()
  vector.project(cameraInstance)

  const x = (vector.x * 0.5 + 0.5) * canvasRect.value.width
  const y = (-vector.y * 0.5 + 0.5) * canvasRect.value.height

  return { x, y }
}

// Update screen positions for all units
const updateScreenPositions = () => {
  if (!props.visible) return

  const rendererInstance = (renderer as any).value
  if (!rendererInstance) return

  const canvas = rendererInstance.domElement
  if (!canvas) return

  canvasRect.value = canvas.getBoundingClientRect()

  const newPositions = new Map<string, { x: number, y: number }>()
  
  props.rackUnits.forEach(unit => {
    const worldPos = getUnitWorldPosition(unit)
    const screenPos = worldToScreen(worldPos)
    if (screenPos) {
      newPositions.set(unit.id, screenPos)
    }
  })

  unitScreenPositions.value = newPositions
}

// Simple seeded hash function for consistent randomness
const hash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generate hand-drawn style path with consistent randomness based on unit ID
const generateHandDrawnPath = (unitId: string, x1: number, y1: number, x2: number, y2: number): string => {
  // Use unit ID to seed randomness for consistency
  const seed = hash(unitId)
  const random1 = (seed % 100) / 100 - 0.5
  const random2 = ((seed * 7) % 100) / 100 - 0.5
  
  // Add slight perpendicular offset for curve
  const dx = x2 - x1
  const dy = y2 - y1
  const perpX = -dy * 0.08
  const perpY = dx * 0.08
  
  // Add consistent randomness based on seed
  const offset1 = random1 * 4
  const offset2 = random2 * 4
  
  const controlX1 = x1 + dx * 0.3 + perpX + offset1
  const controlY1 = y1 + dy * 0.3 + perpY + offset1
  const controlX2 = x2 - dx * 0.3 + perpX + offset2
  const controlY2 = y2 - dy * 0.3 + perpY + offset2
  
  return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`
}

// Watch for visibility changes and update positions
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updateScreenPositions()
    })
  }
}, { immediate: true })

// Update positions on resize and animation frame
let animationFrameId: number | null = null

const startPositionUpdates = () => {
  const update = () => {
    if (props.visible) {
      updateScreenPositions()
    }
    animationFrameId = requestAnimationFrame(update)
  }
  update()
}

const stopPositionUpdates = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

onMounted(() => {
  // Initial update
  nextTick(() => {
    updateScreenPositions()
  })
  
  // Start animation loop for position updates
  if (props.visible) {
    startPositionUpdates()
  }
  
  // Update on window resize
  window.addEventListener('resize', updateScreenPositions)
})

onUnmounted(() => {
  stopPositionUpdates()
  window.removeEventListener('resize', updateScreenPositions)
})

// Watch for visibility to start/stop updates
watch(() => props.visible, (newVal) => {
  if (newVal) {
    startPositionUpdates()
  } else {
    stopPositionUpdates()
  }
})

// Label offset from rack (to the right)
const LABEL_OFFSET_X = 200
</script>

<template>
  <div
    v-if="visible && canvasRect"
    class="fixed pointer-events-none z-40"
    :style="{
      width: `${canvasRect.width}px`,
      height: `${canvasRect.height}px`,
      left: `${canvasRect.left}px`,
      top: `${canvasRect.top}px`
    }"
  >
    <svg
      class="absolute inset-0 w-full h-full"
      :width="canvasRect.width"
      :height="canvasRect.height"
    >
      <!-- Hand-drawn lines connecting units to labels -->
      <g v-for="unit in rackUnits" :key="`line-${unit.id}`">
        <path
          v-if="unitScreenPositions.has(unit.id)"
          :d="generateHandDrawnPath(
            unit.id,
            unitScreenPositions.get(unit.id)!.x,
            unitScreenPositions.get(unit.id)!.y,
            unitScreenPositions.get(unit.id)!.x + LABEL_OFFSET_X,
            unitScreenPositions.get(unit.id)!.y
          )"
          fill="none"
          stroke="white"
          :stroke-width="1.5"
          :opacity="0.85"
          stroke-dasharray="2,2"
          class="transition-opacity duration-300"
        />
      </g>
    </svg>

    <!-- Labels positioned to the right of the rack -->
    <div
      v-for="unit in rackUnits"
      :key="`label-${unit.id}`"
      v-if="unitScreenPositions.has(unit.id)"
      class="absolute pointer-events-auto transition-opacity duration-300"
      :style="{
        left: `${unitScreenPositions.get(unit.id)!.x + LABEL_OFFSET_X}px`,
        top: `${unitScreenPositions.get(unit.id)!.y}px`,
        transform: 'translateY(-50%)',
        opacity: 0.9
      }"
    >
      <div class="text-white" style="font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif; font-size: 14px; line-height: 1.4; max-width: 250px;">
        <div class="font-semibold mb-1">
          {{ t(`maker.rackUnits.${getTranslationKey(unit.id)}.name`) }}
        </div>
        <div class="text-xs opacity-80" style="font-size: 11px;">
          {{ t(`maker.rackUnits.${getTranslationKey(unit.id)}.description`) }}
        </div>
      </div>
    </div>
  </div>
</template>
