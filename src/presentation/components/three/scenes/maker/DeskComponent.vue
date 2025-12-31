<script setup lang="ts">
import type { makerColors } from '@domain/data/makerRack'

defineProps<{
  colors: typeof makerColors
}>()
</script>

<template>
  <TresGroup :position="[-2, 0, 0.5]">
    <!-- Desktop surface -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[4.494, 0.056, 1.798]" />
      <TresMeshStandardMaterial :color="colors.wood" :roughness="0.75" :metalness="0.05" />
    </TresMesh>

    <!-- Left foot with vertical column -->
    <TresGroup :position="[-2.247, -0.9, 0]">
      <!-- Wide flat foot base -->
      <TresMesh :position="[0, -0.7285, 0]">
        <TresBoxGeometry :args="[0.35, 0.05, 1.0]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :metalness="0.3" :roughness="0.6" />
      </TresMesh>
      <!-- Vertical column centered on foot -->
      <TresMesh :position="[0, 0.0585, 0]">
        <TresBoxGeometry :args="[0.12, 1.627, 0.12]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :metalness="0.4" :roughness="0.5" />
      </TresMesh>
      <!-- Corner pads on underside of foot -->
      <TresMesh v-for="(padPos, i) in [[-0.15, -0.7285, -0.45], [0.15, -0.7285, -0.45], [-0.15, -0.7285, 0.45], [0.15, -0.7285, 0.45]] as const"
        :key="`left-pad-${i}`" :position="padPos" :rotation="[Math.PI / 2, 0, 0]">
        <TresCylinderGeometry :args="[0.03, 0.03, 0.02, 16]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.8" />
      </TresMesh>
    </TresGroup>

    <!-- Right foot with vertical column -->
    <TresGroup :position="[2.247, -0.9, 0]">
      <!-- Wide flat foot base -->
      <TresMesh :position="[0, -0.7285, 0]">
        <TresBoxGeometry :args="[0.35, 0.05, 1.0]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :metalness="0.3" :roughness="0.6" />
      </TresMesh>
      <!-- Vertical column centered on foot -->
      <TresMesh :position="[0, 0.0585, 0]">
        <TresBoxGeometry :args="[0.12, 1.627, 0.12]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :metalness="0.4" :roughness="0.5" />
      </TresMesh>
      <!-- Corner pads on underside of foot -->
      <TresMesh v-for="(padPos, i) in [[-0.15, -0.7285, -0.45], [0.15, -0.7285, -0.45], [-0.15, -0.7285, 0.45], [0.15, -0.7285, 0.45]] as const"
        :key="`right-pad-${i}`" :position="padPos" :rotation="[Math.PI / 2, 0, 0]">
        <TresCylinderGeometry :args="[0.03, 0.03, 0.02, 16]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.8" />
      </TresMesh>
    </TresGroup>

    <!-- Desk edge trim -->
    <TresMesh :position="[0, 0, 0.899]">
      <TresBoxGeometry :args="[4.494, 0.056, 0.08]" />
      <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.7" />
    </TresMesh>
  </TresGroup>
</template>

