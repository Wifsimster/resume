<script setup lang="ts">
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
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
            :position="[-0.6 + switchNum * 0.15, 0, 0.37]">
            <TresBoxGeometry :args="[0.1, 0.08, 0.02]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
        <!-- Red illuminated switches -->
        <TresMesh v-for="switchNum in 8" :key="`pdu-led-${switchNum}`"
            :position="[-0.6 + switchNum * 0.15, 0.05, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="'#F44336'" :opacity="0.9" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

