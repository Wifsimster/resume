<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

// Server rack animation
const rackRef = ref()

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (rackRef.value) {
    rackRef.value.rotation.y = Math.sin(elapsed * 0.2) * 0.1
  }
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  startTime = Date.now()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

// Generate LED positions for server rack
const ledPositions = Array.from({ length: 20 }, (_, i) => ({
  x: -1 + (i % 5) * 0.5,
  y: 1.5 - Math.floor(i / 5) * 0.8,
  z: 0.55,
  blinkOffset: Math.random() * Math.PI * 2
}))
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.2" />
  <TresPointLight :position="[0, 3, 5]" :intensity="0.8" color="#FFFFFF" />
  <TresPointLight :position="[-3, 0, 3]" :intensity="0.3" color="#00FF41" />
  <TresPointLight :position="[3, 0, 3]" :intensity="0.3" color="#61DAFB" />
  
  <!-- Server Rack -->
  <TresGroup ref="rackRef" :position="[0, 0, 0]">
    <!-- Rack frame -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[3, 4, 1]" />
      <TresMeshStandardMaterial
        :color="'#1A1A2E'"
        :roughness="0.9"
        :metalness="0.3"
      />
    </TresMesh>
    
    <!-- Rack units (servers) -->
    <TresMesh 
      v-for="i in 4" 
      :key="`server-${i}`"
      :position="[0, 1.5 - (i - 1) * 0.9, 0.3]"
    >
      <TresBoxGeometry :args="[2.6, 0.7, 0.5]" />
      <TresMeshStandardMaterial
        :color="'#2D2D44'"
        :roughness="0.7"
        :metalness="0.5"
      />
    </TresMesh>
    
    <!-- LEDs -->
    <TresMesh
      v-for="(led, index) in ledPositions"
      :key="`led-${index}`"
      :position="[led.x, led.y, led.z]"
    >
      <TresSphereGeometry :args="[0.05, 8, 8]" />
      <TresMeshBasicMaterial
        :color="index % 3 === 0 ? '#00FF41' : index % 3 === 1 ? '#61DAFB' : '#FF6B35'"
      />
    </TresMesh>
    
    <!-- Ventilation grilles -->
    <TresMesh :position="[0, -1.6, 0.51]">
      <TresPlaneGeometry :args="[2.5, 0.4]" />
      <TresMeshBasicMaterial :color="'#0D0D15'" />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor reflection -->
  <TresMesh :position="[0, -2.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial
      :color="'#0A0A12'"
      :roughness="0.3"
      :metalness="0.8"
    />
  </TresMesh>
</template>

