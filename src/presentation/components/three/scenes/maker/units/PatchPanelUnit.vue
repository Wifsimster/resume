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
        <!-- Patch panel ports (24 ports in 2 rows) -->
        <TresMesh v-for="port in 24" :key="`port-${port}`"
            :position="[-0.362 + (port % 12) * 0.0605, -0.15 + Math.floor(port / 12) * 0.3, 0.37]">
            <TresBoxGeometry :args="[0.05, 0.04, 0.02]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" />
        </TresMesh>
        <!-- Port numbers/labels (small text indicators) -->
        <TresMesh v-for="label in 24" :key="`label-${label}`"
            :position="[-0.362 + (label % 12) * 0.0605, -0.15 + Math.floor(label / 12) * 0.3, 0.38]">
            <TresBoxGeometry :args="[0.03, 0.02, 0.01]" />
            <TresMeshStandardMaterial :color="'#2A2A2A'" />
        </TresMesh>
    </BaseServerUnit>
</template>
