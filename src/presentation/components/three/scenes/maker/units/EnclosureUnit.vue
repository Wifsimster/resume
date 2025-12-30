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
        <!-- Blue indicator lights in two rows -->
        <TresMesh v-for="led in 8" :key="`enclosure-led-${led}`"
            :position="[-0.4 + (led % 4) * 0.25, 0.1 - Math.floor(led / 4) * 0.2, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="colors.serverBlue"
                :opacity="Math.sin(anim.time * (1.5 + led * 0.2) + led) > 0.3 ? 1 : 0.3" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

