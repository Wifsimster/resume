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
      <TresBoxGeometry :args="[6, 0.1, 2.5]" />
      <TresMeshStandardMaterial :color="colors.wood" :roughness="0.75" :metalness="0.05" />
    </TresMesh>

    <!-- Desk legs -->
    <TresMesh v-for="(pos, i) in [[-2.8, -0.9, -1], [2.8, -0.9, -1], [-2.8, -0.9, 1], [2.8, -0.9, 1]] as const"
      :key="`leg-${i}`" :position="pos">
      <TresBoxGeometry :args="[0.1, 1.7, 0.1]" />
      <TresMeshStandardMaterial :color="colors.metal" :metalness="0.7" />
    </TresMesh>

    <!-- Desk edge trim -->
    <TresMesh :position="[0, 0, 1.3]">
      <TresBoxGeometry :args="[6, 0.1, 0.08]" />
      <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.7" />
    </TresMesh>
  </TresGroup>
</template>

