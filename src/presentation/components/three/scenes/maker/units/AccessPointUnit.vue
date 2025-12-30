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
        <!-- Circular AP design -->
        <TresMesh :position="[0, 0, 0.36]">
            <TresCylinderGeometry :args="[0.3, 0.3, 0.02, 32]" />
            <TresMeshStandardMaterial :color="'#FFFFFF'" :roughness="0.3" />
        </TresMesh>
        <!-- Status LED -->
        <TresMesh :position="[0, 0.1, 0.38]">
            <TresSphereGeometry :args="[0.02, 8, 8]" />
            <TresMeshBasicMaterial :color="colors.wifi" :opacity="0.9" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

