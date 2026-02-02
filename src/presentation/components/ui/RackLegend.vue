<script setup lang="ts">
import { ref, watch } from 'vue'
import { Vector3 } from 'three'
import { useI18n } from 'vue-i18n'
import type { ServerUnit } from '@domain/types/makerRack'

const props = defineProps<{
  visible: boolean
  rackUnits: ServerUnit[]
  camera?: any
  renderer?: any
}>()

const { t } = useI18n()

const getTranslationKey = (unitId: string): string => {
  const keyMap: Record<string, string> = {
    'udm-pro': 'udmPro',
    'silver-1u': 'silver1u',
    'patch-panel': 'patchPanel',
    'electric-switches': 'electricSwitches',
    'gaming-computer': 'gamingComputer'
  }
  return keyMap[unitId] || unitId
}

// Rack group world position (matches ServerRackComponent.vue :position)
const RACK_POS = { x: 1.372, y: -1.7735, z: 0.5 }
const UNIT_Z_OFFSET = 0.4
// Right edge of rack frame (half width = 0.543)
const RACK_RIGHT_EDGE_X = RACK_POS.x + 0.6

interface UnitPosition {
  unit: ServerUnit
  top: number
  rackEdgeX: number
}

const unitPositions = ref<UnitPosition[]>([])

// Project 3D unit positions to screen coordinates using the camera
const computePositions = () => {
  const cam = props.camera?.value || props.camera
  const ren = props.renderer?.value || props.renderer
  if (!cam || !ren) return

  const sorted = [...props.rackUnits].sort((a, b) => b.y - a.y)

  unitPositions.value = sorted.map(unit => {
    // Project unit visual center to screen (y is base, add half height for center)
    const unitCenterY = RACK_POS.y + unit.y + unit.height / 2
    const worldPos = new Vector3(
      RACK_POS.x,
      unitCenterY,
      RACK_POS.z + UNIT_Z_OFFSET
    )
    worldPos.project(cam)
    const top = (-worldPos.y + 1) / 2 * 100

    // Project rack right edge at the same Y to get the line start X
    const edgePos = new Vector3(
      RACK_RIGHT_EDGE_X,
      unitCenterY,
      RACK_POS.z + UNIT_Z_OFFSET
    )
    edgePos.project(cam)
    const rackEdgeX = (edgePos.x + 1) / 2 * 100

    return { unit, top, rackEdgeX }
  })
}

// Recompute when legend becomes visible (camera is static in rack mode)
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    // Wait a frame for camera matrices to be updated
    requestAnimationFrame(() => {
      computePositions()
    })
  }
}, { immediate: true })
</script>

<template>
  <div
    v-if="visible && unitPositions.length > 0"
    class="absolute inset-0 pointer-events-none z-40 overflow-hidden"
  >
    <div
      v-for="{ unit, top, rackEdgeX } in unitPositions"
      :key="unit.id"
      class="absolute flex items-center gap-0 opacity-90 pointer-events-auto"
      :style="{
        top: `${top}%`,
        left: `${rackEdgeX}%`,
        transform: 'translateY(-50%)'
      }"
    >
      <!-- Dashed line from rack edge to label -->
      <div class="w-6 sm:w-10 md:w-14 border-t border-dashed border-white/60 shrink-0"></div>
      <!-- Label -->
      <div
        class="text-white text-[10px] sm:text-xs whitespace-nowrap pl-1"
        style="font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif; text-shadow: 1px 1px 3px rgba(0,0,0,0.9);"
      >
        {{ t(`maker.rackUnits.${getTranslationKey(unit.id)}.name`) }}
      </div>
    </div>
  </div>
</template>
