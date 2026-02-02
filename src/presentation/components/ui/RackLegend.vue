<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ServerUnit } from '@domain/types/makerRack'

const props = defineProps<{
  visible: boolean
  rackUnits: ServerUnit[]
  camera?: any
  renderer?: any
}>()

const { t } = useI18n()

// Convert unit ID to translation key
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

// PERFORMANCE: Static positions based on rack unit Y values
// No 3D calculations needed - just map Y positions to percentages
// The rack view camera is fixed, so these are predictable
const sortedUnits = computed(() => {
  return [...props.rackUnits].sort((a, b) => b.y - a.y) // Sort by Y (top to bottom in 3D = bottom to top visually)
})
</script>

<template>
  <!-- Simple CSS-only legend - no 3D calculations, no RAF loops -->
  <div
    v-if="visible"
    class="absolute inset-0 pointer-events-none z-40 overflow-hidden"
  >
    <!-- Labels on the right side, evenly distributed -->
    <div class="absolute right-4 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3">
      <div
        v-for="unit in sortedUnits"
        :key="unit.id"
        class="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity pointer-events-auto"
      >
        <!-- Dashed line -->
        <div class="w-8 sm:w-12 md:w-16 border-t border-dashed border-white/60"></div>
        <!-- Label -->
        <div
          class="text-white text-xs sm:text-sm whitespace-nowrap"
          style="font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif; text-shadow: 1px 1px 3px rgba(0,0,0,0.9);"
        >
          {{ t(`maker.rackUnits.${getTranslationKey(unit.id)}.name`) }}
        </div>
      </div>
    </div>
  </div>
</template>
