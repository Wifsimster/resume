<script setup lang="ts">
export interface DustParticle {
  x: number
  y: number
  z: number
  speed: number
  phase: number
}

defineProps<{
  dustParticles: DustParticle[]
  getDustPos: (particle: DustParticle) => { x: number, y: number, z: number }
}>()
</script>

<template>
  <TresMesh v-for="(dust, i) in dustParticles" :key="`dust-${i}`"
    :position="[getDustPos(dust).x, getDustPos(dust).y, getDustPos(dust).z]">
    <TresSphereGeometry :args="[0.01, 4, 4]" />
    <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.1" :transparent="true" />
  </TresMesh>
</template>

