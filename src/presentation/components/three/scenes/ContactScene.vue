<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const sceneRef = ref()
const blocksRef = ref()

// Building blocks positions
const blockPositions = [
  { x: -0.6, y: -0.2, z: 0, color: '#7C3AED' },   // C
  { x: -0.2, y: -0.2, z: 0, color: '#6366F1' },   // O
  { x: 0.2, y: -0.2, z: 0, color: '#F97316' },    // N
  { x: 0.6, y: -0.2, z: 0, color: '#FBBF24' },    // T
  { x: -0.4, y: 0.2, z: 0, color: '#A855F7' },    // A
  { x: 0, y: 0.2, z: 0, color: '#8B5CF6' },       // C
  { x: 0.4, y: 0.2, z: 0, color: '#3B82F6' },     // T
]

// Chair leg positions
const chairLegPositions: [number, number, number][] = [
  [-0.2, -0.25, 0.2],
  [0.2, -0.25, 0.2],
  [-0.2, -0.25, -0.2],
  [0.2, -0.25, -0.2]
]

// Particle positions
const particlePositions = new Float32Array(Array.from({ length: 150 }, () => (Math.random() - 0.5) * 8))

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.15) * 0.1
  }
  
  // Subtle floating animation for blocks
  if (blocksRef.value && blocksRef.value.children) {
    blocksRef.value.children.forEach((block: { position: { y: number } }, i: number) => {
      if (blockPositions[i]) {
        block.position.y = blockPositions[i].y + Math.sin(elapsed + i * 0.5) * 0.05
      }
    })
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
  <TresPerspectiveCamera :position="[0, 1, 5]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 3, 3]" :intensity="0.8" color="#FFFFFF" />
  <TresPointLight :position="[-2, 2, 2]" :intensity="0.3" color="#7C3AED" />
  <TresPointLight :position="[2, 2, 2]" :intensity="0.3" color="#A855F7" />
  
  <TresGroup ref="sceneRef">
    <!-- Letter blocks spelling "CONTACT" -->
    <TresGroup ref="blocksRef">
      <TresMesh 
        v-for="(block, i) in blockPositions" 
        :key="`block-${i}`"
        :position="[block.x, block.y, block.z]"
      >
        <TresBoxGeometry :args="[0.35, 0.35, 0.35]" />
        <TresMeshStandardMaterial
          :color="block.color"
          :roughness="0.7"
          :metalness="0.2"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Empty chair (waiting for player 2) -->
    <TresGroup :position="[1.5, -0.8, 1]">
      <!-- Chair seat -->
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[0.6, 0.1, 0.6]" />
        <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.85" />
      </TresMesh>
      <!-- Chair back -->
      <TresMesh :position="[0, 0.35, -0.25]">
        <TresBoxGeometry :args="[0.6, 0.6, 0.1]" />
        <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.85" />
      </TresMesh>
      <!-- Chair legs -->
      <TresMesh v-for="(pos, i) in chairLegPositions" :key="`chair-leg-${i}`" :position="pos">
        <TresCylinderGeometry :args="[0.03, 0.03, 0.4, 8]" />
        <TresMeshStandardMaterial :color="'#3E2723'" />
      </TresMesh>
    </TresGroup>
    
    <!-- Workbench/desk -->
    <TresMesh :position="[0, -0.5, 0]">
      <TresBoxGeometry :args="[3, 0.15, 1.5]" />
      <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.9" />
    </TresMesh>
    
    <!-- Tools laid out (ready for collaboration) -->
    <TresGroup :position="[-1, -0.35, 0.3]">
      <!-- Hammer -->
      <TresMesh :rotation="[0, 0, 0.2]">
        <TresCylinderGeometry :args="[0.03, 0.03, 0.4, 8]" />
        <TresMeshStandardMaterial :color="'#8B5A2B'" />
      </TresMesh>
      <TresMesh :position="[0.15, 0, 0]">
        <TresBoxGeometry :args="[0.15, 0.08, 0.08]" />
        <TresMeshStandardMaterial :color="'#424242'" :metalness="0.7" />
      </TresMesh>
    </TresGroup>
    
    <!-- Keyboard (for coding together) -->
    <TresMesh :position="[0.8, -0.38, 0.3]">
      <TresBoxGeometry :args="[0.5, 0.03, 0.2]" />
      <TresMeshStandardMaterial :color="'#212121'" :roughness="0.8" />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -1, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial :color="'#1A1410'" :roughness="0.95" />
  </TresMesh>
  
  <!-- Particles (connection/collaboration vibes) -->
  <TresPoints v-if="quality === 'high'">
    <TresBufferGeometry>
      <TresBufferAttribute
        attach="attributes-position"
        :count="50"
        :array="particlePositions"
        :item-size="3"
      />
    </TresBufferGeometry>
    <TresPointsMaterial
      :size="0.03"
      :color="'#00FF41'"
      :opacity="0.4"
      :transparent="true"
    />
  </TresPoints>
</template>

