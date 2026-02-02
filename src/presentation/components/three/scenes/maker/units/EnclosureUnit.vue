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
//             led.material.opacity = Math.sin(elapsed * (1.5 + ledNum * 0.2) + ledNum) > 0.3 ? 1 : 0.3
//         }
//     })
// })
</script>

<template>
    <BaseServerUnit :unit="unit" :is-hovered="isHovered" :colors="colors">
        <!-- Blue indicator lights in two rows - animated via useLoop -->
        <TresMesh v-for="led in 8" :key="`enclosure-led-${led}`"
            :position="[-0.241 + (led % 4) * 0.151, 0.1 - Math.floor(led / 4) * 0.2, 0.38]"
            :geometry="sharedGeometries.smallLED"
            :ref="(el: any) => { if (el) ledRefs[led - 1] = el }">
            <TresMeshBasicMaterial :color="colors.serverBlue" :opacity="0.5" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

