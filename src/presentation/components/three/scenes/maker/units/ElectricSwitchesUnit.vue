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

// Direct Three.js refs for LED animation
const ledRefs = ref<any[]>([])

// DISABLED FOR PERFORMANCE TESTING
// const { onBeforeRender } = useLoop()
// onBeforeRender(({ elapsed }) => {
//     ledRefs.value.forEach((led, index) => {
//         if (led?.material) {
//             const ledNum = index + 1
//             led.material.opacity = Math.sin(elapsed * (1 + ledNum * 0.2) + ledNum) > 0.5 ? 1 : 0.4
//         }
//     })
// })
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- Electric switches (8 toggle switches) -->
        <TresMesh v-for="switchNum in 8" :key="`switch-${switchNum}`"
            :position="[-0.362 + (switchNum - 1) * 0.103, 0, 0.37]">
            <TresBoxGeometry :args="[0.08, 0.06, 0.02]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
        <!-- Switch indicators - animated via useLoop -->
        <TresMesh v-for="led in 8" :key="`switch-led-${led}`"
            :position="[-0.362 + (led - 1) * 0.103, 0.03, 0.38]"
            :geometry="sharedGeometries.tinyLED"
            :ref="(el: any) => { if (el) ledRefs[led - 1] = el }">
            <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.9" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>
