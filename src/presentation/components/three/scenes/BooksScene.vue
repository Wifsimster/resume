<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const shelfRef = ref()

// Book positions on shelf
const bookColors = ['#2E7D32', '#1565C0', '#6A1B9A', '#C62828', '#F57F17', '#00695C']

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (shelfRef.value) {
    shelfRef.value.rotation.y = Math.sin(elapsed * 0.1) * 0.08
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
</script>

<template>
  <TresPerspectiveCamera :position="[0, 1, 6]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.2" />
  <TresPointLight :position="[-2, 3, 3]" :intensity="0.8" color="#FFE4B5" />
  <TresPointLight :position="[2, 2, 2]" :intensity="0.3" color="#FFBF00" />
  
  <TresGroup ref="shelfRef">
    <!-- Bookshelf back -->
    <TresMesh :position="[0, 0.5, -0.6]">
      <TresBoxGeometry :args="[4, 3, 0.1]" />
      <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.9" />
    </TresMesh>
    
    <!-- Bookshelf shelves -->
    <TresMesh v-for="(y, i) in [-0.5, 0.5, 1.5]" :key="`shelf-${i}`" :position="[0, y, -0.25]">
      <TresBoxGeometry :args="[3.8, 0.1, 0.6]" />
      <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.85" />
    </TresMesh>
    
    <!-- Books on top shelf (read) -->
    <TresGroup :position="[-1.2, 1.05, -0.2]">
      <TresMesh 
        v-for="(color, i) in bookColors.slice(0, 4)" 
        :key="`book-top-${i}`"
        :position="[i * 0.35, 0, 0]"
      >
        <TresBoxGeometry :args="[0.15, 0.5, 0.35]" />
        <TresMeshStandardMaterial :color="color" :roughness="0.8" />
      </TresMesh>
    </TresGroup>
    
    <!-- Books on middle shelf (to read) -->
    <TresGroup :position="[-0.5, 0.05, -0.2]">
      <TresMesh 
        v-for="(color, i) in bookColors.slice(4)" 
        :key="`book-mid-${i}`"
        :position="[i * 0.4, 0, 0]"
      >
        <TresBoxGeometry :args="[0.18, 0.55, 0.38]" />
        <TresMeshStandardMaterial :color="color" :roughness="0.8" />
      </TresMesh>
    </TresGroup>
    
    <!-- Reading lamp -->
    <TresGroup :position="[1.5, 0.2, 0.3]">
      <!-- Lamp base -->
      <TresMesh :position="[0, 0, 0]">
        <TresCylinderGeometry :args="[0.15, 0.2, 0.05, 16]" />
        <TresMeshStandardMaterial :color="'#B87333'" :metalness="0.7" />
      </TresMesh>
      <!-- Lamp arm -->
      <TresMesh :position="[0, 0.4, 0]">
        <TresCylinderGeometry :args="[0.02, 0.02, 0.7, 8]" />
        <TresMeshStandardMaterial :color="'#B87333'" :metalness="0.7" />
      </TresMesh>
      <!-- Lamp shade -->
      <TresMesh :position="[0, 0.75, 0]">
        <TresConeGeometry :args="[0.2, 0.25, 16, 1, true]" />
        <TresMeshStandardMaterial 
          :color="'#F5F5DC'" 
          :side="2"
          :emissive="'#FFE4B5'"
          :emissive-intensity="0.3"
        />
      </TresMesh>
      <!-- Light bulb glow -->
      <TresPointLight :position="[0, 0.65, 0]" :intensity="0.5" color="#FFE4B5" />
    </TresGroup>
    
    <!-- Reading chair hint -->
    <TresMesh :position="[0, -1.2, 1.5]">
      <TresBoxGeometry :args="[1.2, 0.6, 1]" />
      <TresMeshStandardMaterial :color="'#4E342E'" :roughness="0.9" />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -1.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial :color="'#1A1410'" :roughness="0.95" />
  </TresMesh>
</template>

