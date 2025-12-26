<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const cardsRef = ref()

// Project card positions (floating)
const cardPositions = [
  { x: -2, y: 0.5, z: 0, rotY: 0.2 },
  { x: 0, y: 1, z: 0.5, rotY: 0 },
  { x: 2, y: 0.3, z: -0.3, rotY: -0.2 },
  { x: -1.5, y: -0.5, z: 0.8, rotY: 0.1 },
  { x: 1.5, y: -0.8, z: 0.3, rotY: -0.1 },
]

// Star particles
const starPositions = new Float32Array(Array.from({ length: 300 }, () => (Math.random() - 0.5) * 15))

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (cardsRef.value) {
    cardsRef.value.rotation.y = Math.sin(elapsed * 0.1) * 0.05
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
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.3" />
  <TresPointLight :position="[0, 3, 5]" :intensity="0.8" color="#FFFFFF" />
  <TresPointLight :position="[-3, 0, 3]" :intensity="0.3" color="#61DAFB" />
  <TresPointLight :position="[3, 0, 3]" :intensity="0.3" color="#42B883" />
  
  <TresGroup ref="cardsRef">
    <!-- Project cards (floating holographic) -->
    <TresGroup 
      v-for="(pos, index) in cardPositions" 
      :key="`card-${index}`"
      :position="[pos.x, pos.y + Math.sin(index) * 0.3, pos.z]"
      :rotation="[0, pos.rotY, 0]"
    >
      <!-- Card background -->
      <TresMesh>
        <TresPlaneGeometry :args="[1.2, 0.8]" />
        <TresMeshStandardMaterial
          :color="'#0D1117'"
          :opacity="0.8"
          :transparent="true"
          :roughness="0.3"
          :metalness="0.5"
        />
      </TresMesh>
      
      <!-- Card border glow -->
      <TresMesh :position="[0, 0, -0.01]">
        <TresPlaneGeometry :args="[1.25, 0.85]" />
        <TresMeshBasicMaterial
          :color="index % 2 === 0 ? '#61DAFB' : '#42B883'"
          :opacity="0.3"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Star icon -->
      <TresMesh :position="[0.4, 0.25, 0.02]">
        <TresOctahedronGeometry :args="[0.08, 0]" />
        <TresMeshBasicMaterial :color="'#FFD93D'" />
      </TresMesh>
    </TresGroup>
    
    <!-- Central GitHub logo representation -->
    <TresMesh :position="[0, 0, -2]">
      <TresOctahedronGeometry :args="[0.5, 1]" />
      <TresMeshStandardMaterial
        :color="'#FFFFFF'"
        :wireframe="true"
        :opacity="0.3"
        :transparent="true"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Particles (stars) -->
  <TresPoints v-if="quality === 'high'">
    <TresBufferGeometry>
      <TresBufferAttribute
        attach="attributes-position"
        :count="100"
        :array="starPositions"
        :item-size="3"
      />
    </TresBufferGeometry>
    <TresPointsMaterial
      :size="0.03"
      :color="'#FFD93D'"
      :opacity="0.6"
      :transparent="true"
    />
  </TresPoints>
</template>

