<script setup lang="ts">
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries, sharedMaterials } from '@application/composables/useSharedGeometries'
import BaseServerUnit from '../BaseServerUnit.vue'

interface AnimationState {
    time: number
    fanRotation: number
}

interface Props {
    unit: ServerUnit
    isHovered: boolean
    anim: AnimationState
    colors: typeof makerColors
}

defineProps<Props>()
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- 8 red illuminated rocker switches -->
        <TresMesh v-for="switchNum in 8" :key="`pdu-switch-${switchNum}`"
            :position="[-0.362 + switchNum * 0.090, 0, 0.37]" :material="sharedMaterials.darkMetal2">
            <TresBoxGeometry :args="[0.1, 0.08, 0.02]" />
        </TresMesh>
        <!-- Red illuminated switches - using shared LED geometry -->
        <TresMesh v-for="switchNum in 8" :key="`pdu-led-${switchNum}`"
            :position="[-0.362 + switchNum * 0.090, 0.05, 0.38]" :geometry="sharedGeometries.smallLED"
            :material="sharedMaterials.ledRed">
        </TresMesh>
    </BaseServerUnit>
</template>

