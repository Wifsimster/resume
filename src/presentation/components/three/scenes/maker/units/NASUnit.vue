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
//             led.material.opacity = Math.sin(elapsed * (2 + ledNum) + ledNum) > 0.3 ? 1 : 0.4
//         }
//     })
// })
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- SilverStone logo area -->
        <TresMesh :position="[0.302, 0, 0.37]">
            <TresPlaneGeometry :args="[0.2, 0.1]" />
            <TresMeshBasicMaterial :color="'#2D2D2D'" />
        </TresMesh>
        <!-- Blue LED indicators - animated via useLoop -->
        <TresMesh v-for="led in 4" :key="`nas-led-${led}`" :position="[-0.302 + led * 0.151, 0.15, 0.38]"
            :geometry="sharedGeometries.smallLED"
            :ref="(el: any) => { if (el) ledRefs[led - 1] = el }">
            <TresMeshBasicMaterial :color="colors.serverBlue" :opacity="0.5" :transparent="true" />
        </TresMesh>
        <!-- Drive bays -->
        <TresMesh v-for="bay in 4" :key="`nas-bay-${bay}`" :position="[-0.302 + bay * 0.151, -0.15, 0.37]"
            :material="sharedMaterials.darkMetal3">
            <TresBoxGeometry :args="[0.18, 0.12, 0.02]" />
        </TresMesh>
    </BaseServerUnit>
</template>

