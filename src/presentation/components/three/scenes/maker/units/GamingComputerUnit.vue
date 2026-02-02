<script setup lang="ts">
import { ref } from 'vue'
// import { useLoop } from '@tresjs/core' // DISABLED FOR TESTING
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries } from '@application/composables/useSharedGeometries'
import BaseServerUnit from '../BaseServerUnit.vue'

interface Props {
    unit: ServerUnit
    isHovered: boolean
    colors: typeof makerColors
}

defineProps<Props>()

// Direct Three.js ref for LED animation
const statusLedRef = ref<any>(null)

// DISABLED FOR PERFORMANCE TESTING
// const { onBeforeRender } = useLoop()
// onBeforeRender(({ elapsed }) => {
//     if (statusLedRef.value?.material) {
//         statusLedRef.value.material.opacity = Math.sin(elapsed * 2) > 0.3 ? 1 : 0.5
//     }
// })
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- Gaming computer front panel details -->
        <!-- Power button -->
        <TresMesh :position="[-0.4, 0.15, 0.37]" :geometry="sharedGeometries.smallLED">
            <TresMeshStandardMaterial :color="colors.serverGreen" />
        </TresMesh>
        <!-- Status LED - animated via useLoop -->
        <TresMesh :position="[-0.35, 0.15, 0.37]" :geometry="sharedGeometries.tinyLED"
            :ref="(el: any) => { statusLedRef = el }">
            <TresMeshBasicMaterial :color="colors.serverBlue" :opacity="0.9" :transparent="true" />
        </TresMesh>
        <!-- Front panel vents/grilles -->
        <TresMesh v-for="vent in 6" :key="`vent-${vent}`"
            :position="[-0.2 + vent * 0.08, -0.1, 0.37]">
            <TresBoxGeometry :args="[0.06, 0.15, 0.01]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" />
        </TresMesh>
        <!-- GPU/PCIe slot indicators -->
        <TresMesh v-for="slot in 3" :key="`slot-${slot}`"
            :position="[0.2 + slot * 0.1, 0, 0.37]">
            <TresBoxGeometry :args="[0.08, 0.05, 0.01]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
    </BaseServerUnit>
</template>
