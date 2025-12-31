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

    <!-- Screen with content texture -->
    <TresMesh :position="[0, 0, 0.085]">
      <TresPlaneGeometry :args="[1.55, 0.87]" />
      <TresMeshBasicMaterial :map="screenTexture" />
    </TresMesh>
  </TresGroup>
</template>

