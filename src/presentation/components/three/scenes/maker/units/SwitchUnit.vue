<script setup lang="ts">
import { ref } from 'vue'
// import { useLoop } from '@tresjs/core' // DISABLED FOR TESTING
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries, sharedMaterials } from '@application/composables/useSharedGeometries'
import BaseServerUnit from '../BaseServerUnit.vue'

interface Props {
    unit: ServerUnit
    isHovered: boolean
    colors: typeof makerColors
}

defineProps<Props>()

// Direct Three.js refs for LED animation (bypasses Vue reactivity)
const ledRefs = ref<any[]>([])

// DISABLED FOR PERFORMANCE TESTING
// const { onBeforeRender } = useLoop()
// onBeforeRender(({ elapsed }) => {
//     ledRefs.value.forEach((led, index) => {
//         if (led?.material) {
//             const ledNum = index + 1
//             led.material.opacity = Math.sin(elapsed * (2 + ledNum * 0.3) + ledNum) > 0.3 ? 1 : 0.3
//         }
//     })
// })
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- Ethernet ports with indicator lights -->
        <TresMesh v-for="port in 12" :key="`port-${port}`"
            :position="[-0.362 + (port % 6) * 0.121, -0.15 + Math.floor(port / 6) * 0.3, 0.37]"
            :material="sharedMaterials.darkMetal">
            <TresBoxGeometry :args="[0.08, 0.06, 0.02]" />
        </TresMesh>
        <!-- Port indicator lights - animated via useLoop -->
        <TresMesh v-for="led in 12" :key="`switch-led-${led}`"
            :position="[-0.362 + (led % 6) * 0.121, -0.12 + Math.floor(led / 6) * 0.3, 0.38]"
            :geometry="sharedGeometries.tinyLED"
            :ref="(el: any) => { if (el) ledRefs[led - 1] = el }">
            <TresMeshBasicMaterial :color="led % 3 === 0 ? '#00FF00' : '#0088FF'" :opacity="0.9" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

