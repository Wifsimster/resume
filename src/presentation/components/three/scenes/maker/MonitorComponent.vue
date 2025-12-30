<script setup lang="ts">
import type { CanvasTexture } from 'three'
import type { makerColors } from '@domain/data/makerRack'

defineProps<{
  screenTexture: CanvasTexture | null
  colors: typeof makerColors
}>()
</script>

<template>
  <TresGroup :position="[-2, 1.8, -1]">
    <!-- Monitor frame (32 inch, 16:9 ratio) -->
    <TresMesh>
      <TresBoxGeometry :args="[5.5, 3.1, 0.12]" />
      <TresMeshStandardMaterial :color="colors.darkMetal" :roughness="0.25" />
    </TresMesh>

    <!-- Screen with content texture -->
    <TresMesh :position="[0, 0, 0.065]">
      <TresPlaneGeometry :args="[5.3, 2.98]" />
      <TresMeshBasicMaterial :map="screenTexture" />
    </TresMesh>
  </TresGroup>
</template>

