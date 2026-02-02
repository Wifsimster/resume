<script setup lang="ts">
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedMaterials } from '@application/composables/useSharedGeometries'
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
        <!-- Small display area -->
        <TresMesh :position="[-0.181, 0, 0.37]" :material="sharedMaterials.darkMetal">
            <TresPlaneGeometry :args="[0.4, 0.15]" />
        </TresMesh>
    </BaseServerUnit>
</template>

