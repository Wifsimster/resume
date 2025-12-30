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
        <!-- LCD display on the left showing "13 37" in yellow-green -->
        <TresMesh :position="[-0.6, 0, 0.37]">
            <TresPlaneGeometry :args="[0.25, 0.25]" />
            <TresMeshBasicMaterial :color="'#0A0A0A'" />
        </TresMesh>
        <!-- LCD numbers background (yellow-green glow for "13 37") -->
        <TresMesh :position="[-0.6, 0.05, 0.371]">
            <TresPlaneGeometry :args="[0.2, 0.15]" />
            <TresMeshBasicMaterial :color="'#ADFF2F'" :opacity="0.4" :transparent="true" />
        </TresMesh>

        <!-- Directional pad in center -->
        <!-- Up arrow button -->
        <TresMesh :position="[0, 0.08, 0.37]">
            <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
        <!-- Down arrow button -->
        <TresMesh :position="[0, -0.08, 0.37]">
            <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
        <!-- Left arrow button -->
        <TresMesh :position="[-0.08, 0, 0.37]">
            <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
        <!-- Right arrow button -->
        <TresMesh :position="[0.08, 0, 0.37]">
            <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>
        <!-- Center OK button (square, slightly larger) -->
        <TresMesh :position="[0, 0, 0.37]">
            <TresBoxGeometry :args="[0.06, 0.06, 0.01]" />
            <TresMeshStandardMaterial :color="'#2D2D2D'" />
        </TresMesh>

        <!-- Back/Menu button (circular with curved arrow) to the right of pad -->
        <TresMesh :position="[0.2, 0, 0.37]">
            <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
        </TresMesh>

        <!-- Freebox logo text on the far right -->
        <TresMesh :position="[0.5, 0, 0.37]">
            <TresPlaneGeometry :args="[0.25, 0.08]" />
            <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.9" :transparent="true" />
        </TresMesh>
    </BaseServerUnit>
</template>

