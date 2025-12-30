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
        <!-- Ethernet ports with indicator lights -->
        <TresMesh v-for="port in 12" :key="`port-${port}`"
            :position="[-0.6 + (port % 6) * 0.2, -0.15 + Math.floor(port / 6) * 0.3, 0.37]">
            <TresBoxGeometry :args="[0.08, 0.06, 0.02]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" />
        </TresMesh>
        <!-- Port indicator lights -->
        <TresMesh v-for="led in 12" :key="`switch-led-${led}`"
            :position="[-0.6 + (led % 6) * 0.2, -0.12 + Math.floor(led / 6) * 0.3, 0.38]">
            <TresSphereGeometry :args="[0.015, 6, 6]" />
            <TresMeshBasicMaterial :color="led % 3 === 0 ? colors.serverGreen : colors.wifi"
                :opacity="Math.sin(anim.time * (2 + led * 0.3) + led) > 0.3 ? 1 : 0.3" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

