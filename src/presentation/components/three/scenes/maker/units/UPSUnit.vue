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
        <!-- Status display -->
        <TresMesh :position="[0, 0.1, 0.37]">
            <TresPlaneGeometry :args="[0.4, 0.15]" />
            <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.8" :transparent="true" />
        </TresMesh>
        <!-- Battery status LEDs -->
        <TresMesh v-for="bat in 5" :key="`ups-bat-${bat}`" :position="[-0.302 + bat * 0.072, -0.1, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="bat < 4 ? colors.serverGreen : colors.led"
                :opacity="bat < 4 ? 0.9 : 0.3" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

