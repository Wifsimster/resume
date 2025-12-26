<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
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

// Star particles positions (100 points * 3 coordinates = 300 values)
const starPositions = (() => {
  const positions = new Float32Array(100 * 3)
  for (let i = 0; i < 100; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15
  }
  return positions
})()

// Particles using shallowRef to avoid reactivity issues
const particles = shallowRef<Points | null>(null)

const createParticles = () => {
  // Dispose existing particles first
  if (particles.value) {
    particles.value.geometry.dispose()
    ;(particles.value.material as PointsMaterial).dispose()
    particles.value = null
  }
  
  if (props.quality !== 'high') return
  
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  
  const material = new PointsMaterial({
    color: 0xFFD93D,
    size: 0.03,
    opacity: 0.6,
    transparent: true
  })
  
  particles.value = new Points(geometry, material)
}

// Watch quality changes
watch(() => props.quality, createParticles, { immediate: true })

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

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  if (particles.value) {
    particles.value.geometry.dispose()
    ;(particles.value.material as PointsMaterial).dispose()
  }
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
  
  <!-- Background stars/particles -->
  <primitive v-if="particles" :object="particles" />
</template>

