<script setup lang="ts">
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'

interface Props {
    unit: ServerUnit
    isHovered: boolean
    colors: typeof makerColors
}

const props = defineProps<Props>()
</script>

<template>
    <!-- Unit chassis with hover effect -->
    <!-- Freebox has custom dimensions: 180 x 45 x 190 mm, depth scaled proportionally -->
    <TresMesh v-if="unit.type === 'freebox'">
        <TresBoxGeometry :args="[1.5, unit.height, 0.44]" />
        <TresMeshStandardMaterial :color="isHovered ? '#B87333' : unit.color" :roughness="0.4"
            :metalness="0.3" :emissive="isHovered ? '#B87333' : '#000000'"
            :emissive-intensity="isHovered ? 0.2 : 0" />
    </TresMesh>
    <TresMesh v-else>
        <TresBoxGeometry :args="[1.5, unit.height, 0.7]" />
        <TresMeshStandardMaterial :color="isHovered ? '#B87333' : unit.color" :roughness="0.35"
            :metalness="unit.type === 'silver-1u' ? 0.8 : 0.6"
            :emissive="isHovered ? '#B87333' : '#000000'"
            :emissive-intensity="isHovered ? 0.2 : 0" />
    </TresMesh>

    <!-- Unit front plate -->
    <TresMesh :position="[0, 0, 0.36]">
        <TresBoxGeometry :args="[1.45, unit.height - 0.1, 0.02]" />
        <TresMeshStandardMaterial
            :color="unit.type === 'pdu' ? '#1A1A1A' : unit.color === '#FFFFFF' ? '#F5F5F5' : '#1A1A1A'"
            :roughness="0.25" :metalness="0.8" />
    </TresMesh>

    <!-- Slot for unit-specific details -->
    <slot />
</template>

