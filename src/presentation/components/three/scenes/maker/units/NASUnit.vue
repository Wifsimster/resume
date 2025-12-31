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

const props = defineProps<Props>()
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- SilverStone logo area -->
        <TresMesh :position="[0.302, 0, 0.37]">
            <TresPlaneGeometry :args="[0.2, 0.1]" />
            <TresMeshBasicMaterial :color="'#2D2D2D'" />
        </TresMesh>
        <!-- Blue LED indicators -->
        <TresMesh v-for="led in 4" :key="`nas-led-${led}`" :position="[-0.302 + led * 0.151, 0.15, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="colors.serverBlue"
                :opacity="Math.sin(anim.time * (2 + led) + led) > 0.3 ? 1 : 0.4" :transparent="true" />
        </TresMesh>
        <!-- Drive bays -->
        <TresMesh v-for="bay in 4" :key="`nas-bay-${bay}`" :position="[-0.302 + bay * 0.151, -0.15, 0.37]">
            <TresBoxGeometry :args="[0.18, 0.12, 0.02]" />
            <TresMeshStandardMaterial :color="'#2D2D2D'" :metalness="0.5" />
        </TresMesh>
    </BaseServerUnit>
</template>

