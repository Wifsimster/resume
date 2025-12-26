<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const benchRef = ref()

// Tool positions on workbench
const tools = [
  { x: -1.5, y: 0.6, z: 0, type: 'digital', color: '#42B883' },
  { x: -0.8, y: 0.6, z: 0.3, type: 'digital', color: '#61DAFB' },
  { x: 0, y: 0.6, z: 0, type: 'highlight', color: '#00FF41' },
  { x: 0.8, y: 0.6, z: 0.3, type: 'physical', color: '#B87333' },
  { x: 1.5, y: 0.6, z: 0, type: 'physical', color: '#8B5A2B' },
]

// Leg positions typed as tuples
const legPositions: [number, number, number][] = [
  [-1.7, -0.7, 0.7],
  [1.7, -0.7, 0.7],
  [-1.7, -0.7, -0.7],
  [1.7, -0.7, -0.7]
]

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (benchRef.value) {
    benchRef.value.rotation.y = Math.sin(elapsed * 0.15) * 0.08
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
  <TresPerspectiveCamera :position="[0, 3, 6]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 4, 3]" :intensity="1" color="#FFFFFF" />
  <TresPointLight :position="[-2, 2, 2]" :intensity="0.3" color="#42B883" />
  <TresPointLight :position="[2, 2, 2]" :intensity="0.3" color="#B87333" />
  
  <TresGroup ref="benchRef">
    <!-- Workbench surface -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[4, 0.3, 2]" />
      <TresMeshStandardMaterial
        :color="'#5D4037'"
        :roughness="0.9"
        :metalness="0.1"
      />
    </TresMesh>
    
    <!-- Bench legs -->
    <TresMesh v-for="(pos, i) in legPositions" :key="`leg-${i}`" :position="pos">
      <TresBoxGeometry :args="[0.15, 1.1, 0.15]" />
      <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.9" />
    </TresMesh>
    
    <!-- Tool pegboard backdrop -->
    <TresMesh :position="[0, 1.5, -1.2]">
      <TresBoxGeometry :args="[4.5, 2.5, 0.1]" />
      <TresMeshStandardMaterial
        :color="'#4E342E'"
        :roughness="0.95"
      />
    </TresMesh>
    
    <!-- Tools on bench -->
    <TresGroup v-for="(tool, index) in tools" :key="`tool-${index}`" :position="[tool.x, tool.y, tool.z]">
      <!-- Digital tools = cubes with glow -->
      <TresMesh v-if="tool.type === 'digital' || tool.type === 'highlight'">
        <TresBoxGeometry :args="[0.3, 0.3, 0.3]" />
        <TresMeshStandardMaterial
          :color="tool.color"
          :emissive="tool.color"
          :emissive-intensity="tool.type === 'highlight' ? 0.4 : 0.2"
          :roughness="0.3"
          :metalness="0.7"
        />
      </TresMesh>
      
      <!-- Physical tools = cylinders (like chisels) -->
      <TresMesh v-if="tool.type === 'physical'" :rotation="[Math.PI / 2, 0, 0]">
        <TresCylinderGeometry :args="[0.05, 0.08, 0.5, 8]" />
        <TresMeshStandardMaterial
          :color="tool.color"
          :roughness="0.7"
          :metalness="0.3"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Skill level indicators (floating) -->
    <TresMesh :position="[0, 2.2, -1]">
      <TresRingGeometry :args="[0.3, 0.35, 5]" />
      <TresMeshBasicMaterial :color="'#FFD93D'" :side="2" />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -1.3, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[12, 12]" />
    <TresMeshStandardMaterial :color="'#1A1410'" :roughness="0.95" />
  </TresMesh>
</template>

