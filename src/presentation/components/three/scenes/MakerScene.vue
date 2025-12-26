<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const sceneRef = ref()
const ledHue = ref(0)

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.1) * 0.1
  }
  // Animate LED hue
  ledHue.value = (elapsed * 50) % 360
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  startTime = Date.now()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

// LED strip positions
const ledPositions = Array.from({ length: 12 }, (_, i) => ({
  x: -2.5 + i * 0.45,
  y: 2.2,
  z: -1.5
}))
</script>

<template>
  <TresPerspectiveCamera :position="[0, 2, 7]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.3" />
  <TresPointLight :position="[0, 4, 4]" :intensity="0.8" color="#FFFFFF" />
  <TresPointLight :position="[-3, 2, 2]" :intensity="0.3" color="#C51A4A" />
  <TresPointLight :position="[3, 2, 2]" :intensity="0.3" color="#00979D" />
  
  <TresGroup ref="sceneRef">
    <!-- Workbench -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[5, 0.2, 3]" />
      <TresMeshStandardMaterial :color="'#4E342E'" :roughness="0.9" />
    </TresMesh>
    
    <!-- Raspberry Pi (simplified) -->
    <TresGroup :position="[-1.5, 0.25, 0]">
      <TresMesh>
        <TresBoxGeometry :args="[0.8, 0.1, 0.5]" />
        <TresMeshStandardMaterial :color="'#2E7D32'" :roughness="0.7" />
      </TresMesh>
      <!-- GPIO pins -->
      <TresMesh :position="[0.25, 0.08, 0]">
        <TresBoxGeometry :args="[0.2, 0.06, 0.05]" />
        <TresMeshStandardMaterial :color="'#FFD700'" :metalness="0.8" />
      </TresMesh>
      <!-- LED indicator -->
      <TresMesh :position="[-0.3, 0.08, 0.15]">
        <TresSphereGeometry :args="[0.03, 8, 8]" />
        <TresMeshBasicMaterial :color="'#00FF00'" />
      </TresMesh>
    </TresGroup>
    
    <!-- ESP8266 (simplified) -->
    <TresGroup :position="[0, 0.2, 0.5]">
      <TresMesh>
        <TresBoxGeometry :args="[0.5, 0.08, 0.25]" />
        <TresMeshStandardMaterial :color="'#1565C0'" :roughness="0.6" />
      </TresMesh>
      <!-- Antenna -->
      <TresMesh :position="[0.2, 0.06, 0]">
        <TresBoxGeometry :args="[0.08, 0.04, 0.15]" />
        <TresMeshStandardMaterial :color="'#37474F'" />
      </TresMesh>
    </TresGroup>
    
    <!-- Arduino (simplified) -->
    <TresGroup :position="[1.5, 0.2, 0]">
      <TresMesh>
        <TresBoxGeometry :args="[0.7, 0.08, 0.5]" />
        <TresMeshStandardMaterial :color="'#00796B'" :roughness="0.7" />
      </TresMesh>
      <!-- USB port -->
      <TresMesh :position="[-0.25, 0.06, 0]">
        <TresBoxGeometry :args="[0.12, 0.05, 0.08]" />
        <TresMeshStandardMaterial :color="'#90A4AE'" :metalness="0.7" />
      </TresMesh>
    </TresGroup>
    
    <!-- Soldering iron -->
    <TresGroup :position="[0.5, 0.15, -0.8]" :rotation="[0, 0.3, 0]">
      <TresMesh :rotation="[0, 0, Math.PI / 2]">
        <TresCylinderGeometry :args="[0.02, 0.04, 0.8, 8]" />
        <TresMeshStandardMaterial :color="'#FFA000'" />
      </TresMesh>
      <!-- Tip glow -->
      <TresMesh :position="[0.35, 0, 0]">
        <TresSphereGeometry :args="[0.03, 8, 8]" />
        <TresMeshBasicMaterial :color="'#FF5722'" />
      </TresMesh>
    </TresGroup>
    
    <!-- LED Strip (WS2812) -->
    <TresGroup>
      <TresMesh 
        v-for="(led, i) in ledPositions" 
        :key="`led-${i}`"
        :position="[led.x, led.y, led.z]"
      >
        <TresSphereGeometry :args="[0.08, 8, 8]" />
        <TresMeshBasicMaterial
          :color="`hsl(${(i * 30 + ledHue) % 360}, 100%, 50%)`"
        />
      </TresMesh>
      <!-- LED strip base -->
      <TresMesh :position="[0, 2.2, -1.55]">
        <TresBoxGeometry :args="[5.5, 0.1, 0.05]" />
        <TresMeshStandardMaterial :color="'#212121'" />
      </TresMesh>
    </TresGroup>
    
    <!-- Backdrop (wall) -->
    <TresMesh :position="[0, 1.5, -2]">
      <TresPlaneGeometry :args="[6, 4]" />
      <TresMeshStandardMaterial :color="'#263238'" :roughness="0.95" />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -0.1, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[12, 12]" />
    <TresMeshStandardMaterial :color="'#1A1410'" :roughness="0.95" />
  </TresMesh>
</template>

