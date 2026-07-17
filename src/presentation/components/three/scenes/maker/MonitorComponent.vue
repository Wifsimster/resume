<script setup lang="ts">
import type { CanvasTexture } from 'three'
import type { makerColors } from '@domain/data/makerRack'

defineProps<{
  screenTexture: CanvasTexture | null
  colors: typeof makerColors
}>()
</script>

<template>
  <TresGroup :position="[-2, 0.925, 0.2]">
    <!-- Monitor frame (32 inch, 16:9 ratio) -->
    <TresMesh>
      <TresBoxGeometry :args="[1.59, 0.896, 0.157]" />
      <TresMeshStandardMaterial :color="colors.darkMetal" :roughness="0.25" />
    </TresMesh>

    <!-- Screen with content texture. Unlit and excluded from tone mapping so
         the display reads bright and true like a real backlit panel. -->
    <TresMesh :position="[0, 0, 0.085]">
      <TresPlaneGeometry :args="[1.55, 0.87]" />
      <TresMeshBasicMaterial :map="screenTexture" :tone-mapped="false" />
    </TresMesh>

    <!-- Bottom bezel accent strip -->
    <TresMesh :position="[0, -0.46, 0.08]">
      <TresBoxGeometry :args="[1.59, 0.024, 0.02]" />
      <TresMeshStandardMaterial :color="'#B87333'" :roughness="0.35" :metalness="0.6" />
    </TresMesh>

    <!-- Power LED -->
    <TresMesh :position="[0.7, -0.46, 0.095]">
      <TresSphereGeometry :args="[0.012, 8, 8]" />
      <TresMeshBasicMaterial :color="'#00FF88'" />
    </TresMesh>

    <!-- Stand neck -->
    <TresMesh :position="[0, -0.62, -0.03]" :rotation="[-0.12, 0, 0]">
      <TresBoxGeometry :args="[0.09, 0.42, 0.04]" />
      <TresMeshStandardMaterial :color="'#2A2A2A'" :roughness="0.4" :metalness="0.7" />
    </TresMesh>

    <!-- Stand base plate on the desk -->
    <TresMesh :position="[0, -0.88, 0.02]">
      <TresBoxGeometry :args="[0.52, 0.025, 0.34]" />
      <TresMeshStandardMaterial :color="'#2A2A2A'" :roughness="0.35" :metalness="0.75" />
    </TresMesh>

    <!-- Rear cable running down the neck -->
    <TresMesh :position="[0, -0.62, -0.07]" :rotation="[-0.12, 0, 0]">
      <TresCylinderGeometry :args="[0.012, 0.012, 0.4, 8]" />
      <TresMeshStandardMaterial :color="'#111111'" :roughness="0.9" />
    </TresMesh>
  </TresGroup>
</template>
