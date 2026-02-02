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
        <!-- Status LED (blue, like real Freebox Mini) -->
        <TresMesh :position="[-0.42, 0, 0.38]">
            <TresSphereGeometry :args="[0.02, 8, 8]" />
            <TresMeshBasicMaterial :color="'#00AAFF'" :opacity="0.95" :transparent="true" />
        </TresMesh>
        <!-- LED glow halo -->
        <TresMesh :position="[-0.42, 0, 0.375]">
            <TresCircleGeometry :args="[0.04, 12]" />
            <TresMeshBasicMaterial :color="'#00AAFF'" :opacity="0.2" :transparent="true" />
        </TresMesh>

        <!-- LCD display background -->
        <TresMesh :position="[-0.25, 0, 0.37]">
            <TresPlaneGeometry :args="[0.22, 0.06]" />
            <TresMeshBasicMaterial :color="'#050505'" />
        </TresMesh>
        <!-- LCD numbers (yellow-green glow) -->
        <TresMesh :position="[-0.25, 0, 0.371]">
            <TresPlaneGeometry :args="[0.18, 0.04]" />
            <TresMeshBasicMaterial :color="'#ADFF2F'" :opacity="0.8" :transparent="true" />
        </TresMesh>

        <!-- D-pad buttons (lighter color for visibility) -->
        <TresMesh :position="[0.05, 0.03, 0.37]">
            <TresCylinderGeometry :args="[0.025, 0.025, 0.01, 12]" />
            <TresMeshStandardMaterial :color="'#3A3A3A'" :metalness="0.5" />
        </TresMesh>
        <TresMesh :position="[0.05, -0.03, 0.37]">
            <TresCylinderGeometry :args="[0.025, 0.025, 0.01, 12]" />
            <TresMeshStandardMaterial :color="'#3A3A3A'" :metalness="0.5" />
        </TresMesh>
        <TresMesh :position="[0.02, 0, 0.37]">
            <TresCylinderGeometry :args="[0.025, 0.025, 0.01, 12]" />
            <TresMeshStandardMaterial :color="'#3A3A3A'" :metalness="0.5" />
        </TresMesh>
        <TresMesh :position="[0.08, 0, 0.37]">
            <TresCylinderGeometry :args="[0.025, 0.025, 0.01, 12]" />
            <TresMeshStandardMaterial :color="'#3A3A3A'" :metalness="0.5" />
        </TresMesh>
        <!-- Center OK button -->
        <TresMesh :position="[0.05, 0, 0.37]">
            <TresBoxGeometry :args="[0.03, 0.03, 0.01]" />
            <TresMeshStandardMaterial :color="'#4A4A4A'" :metalness="0.5" />
        </TresMesh>

        <!-- Freebox logo area on the right -->
        <TresMesh :position="[0.3, 0, 0.37]">
            <TresPlaneGeometry :args="[0.2, 0.05]" />
            <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.85" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

