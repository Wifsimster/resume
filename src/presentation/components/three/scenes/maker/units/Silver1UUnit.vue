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
        <!-- Status LEDs -->
        <TresMesh :position="[0.302, 0.08, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.9" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

