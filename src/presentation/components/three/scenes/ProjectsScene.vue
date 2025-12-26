<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

// Theme colors
const themeColors = {
  primary: '#61DAFB',    // React blue
  secondary: '#42B883',  // Vue green
  accent: '#FFD93D',     // Star gold
  dark: '#0D1117'        // GitHub dark
}

const cardsRef = ref()
const centralRef = ref()

// Project card positions (floating)
const cardPositions = [
  { x: -2.2, y: 0.8, z: 0.5, rotY: 0.3 },
  { x: 0, y: 1.2, z: 1, rotY: 0 },
  { x: 2.2, y: 0.6, z: 0.3, rotY: -0.3 },
  { x: -1.6, y: -0.6, z: 0.8, rotY: 0.15 },
  { x: 1.6, y: -0.9, z: 0.6, rotY: -0.15 },
]

// Reactive card states for individual animations
const cardStates = reactive(
  cardPositions.map((pos, index) => ({
    y: pos.y,
    rotZ: 0,
    scale: 1,
    glowIntensity: 0.3,
    phaseOffset: index * 0.8
  }))
)

// Star particle positions (generated once)
const starParticles = Array.from({ length: 40 }, (_, i) => ({
  x: (Math.sin(i * 2.1) * 8),
  y: (Math.cos(i * 1.7) * 6),
  z: -2 - (i % 4) * 1.5,
  pulseOffset: Math.random() * Math.PI * 2
}))

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000

  // Animate main group with gentle rotation
  if (cardsRef.value) {
    cardsRef.value.rotation.y = Math.sin(elapsed * 0.15) * 0.1
    cardsRef.value.position.y = Math.sin(elapsed * 0.2) * 0.05
  }

  // Animate central element
  if (centralRef.value) {
    centralRef.value.rotation.y = elapsed * 0.3
    centralRef.value.rotation.x = Math.sin(elapsed * 0.5) * 0.2
    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.1
    centralRef.value.scale.set(pulse, pulse, pulse)
  }

  // Animate each card individually
  cardPositions.forEach((pos, index) => {
    const phase = elapsed + cardStates[index].phaseOffset
    cardStates[index].y = pos.y + Math.sin(phase * 0.8) * 0.15
    cardStates[index].rotZ = Math.sin(phase * 0.5) * 0.05
    cardStates[index].scale = 1 + Math.sin(phase * 0.6) * 0.03
    cardStates[index].glowIntensity = 0.2 + Math.sin(phase * 1.2) * 0.15
  })

  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  startTime = Date.now()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />
  
  <!-- Enhanced lighting -->
  <TresAmbientLight :intensity="0.3" />
  <TresPointLight :position="[0, 3, 5]" :intensity="1" color="#FFFFFF" />
  <TresPointLight :position="[-4, 1, 3]" :intensity="0.5" :color="themeColors.primary" />
  <TresPointLight :position="[4, 1, 3]" :intensity="0.5" :color="themeColors.secondary" />
  <TresPointLight :position="[0, -2, 4]" :intensity="0.3" :color="themeColors.accent" />
  
  <TresGroup ref="cardsRef">
    <!-- Project cards (floating holographic) -->
    <TresGroup 
      v-for="(pos, index) in cardPositions" 
      :key="`card-${index}`"
      :position="[pos.x, cardStates[index].y, pos.z]"
      :rotation="[0, pos.rotY, cardStates[index].rotZ]"
      :scale="[cardStates[index].scale, cardStates[index].scale, 1]"
    >
      <!-- Card background -->
      <TresMesh>
        <TresPlaneGeometry :args="[1.3, 0.9]" />
        <TresMeshStandardMaterial
          :color="themeColors.dark"
          :emissive="index % 2 === 0 ? themeColors.primary : themeColors.secondary"
          :emissive-intensity="0.05"
          :opacity="0.9"
          :transparent="true"
          :roughness="0.3"
          :metalness="0.6"
        />
      </TresMesh>
      
      <!-- Card border glow -->
      <TresMesh :position="[0, 0, -0.01]">
        <TresPlaneGeometry :args="[1.38, 0.98]" />
        <TresMeshBasicMaterial
          :color="index % 2 === 0 ? themeColors.primary : themeColors.secondary"
          :opacity="cardStates[index].glowIntensity"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Inner border accent -->
      <TresMesh :position="[0, 0, 0.01]">
        <TresPlaneGeometry :args="[1.2, 0.8]" />
        <TresMeshBasicMaterial
          :color="index % 2 === 0 ? themeColors.primary : themeColors.secondary"
          :wireframe="true"
          :opacity="0.2"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Star icon with glow -->
      <TresMesh :position="[0.45, 0.3, 0.02]">
        <TresOctahedronGeometry :args="[0.1, 0]" />
        <TresMeshStandardMaterial 
          :color="themeColors.accent"
          :emissive="themeColors.accent"
          :emissive-intensity="0.8"
        />
      </TresMesh>
      
      <!-- Code lines representation -->
      <TresMesh 
        v-for="line in 3" 
        :key="`line-${index}-${line}`"
        :position="[-0.2, 0.1 - line * 0.15, 0.02]"
      >
        <TresPlaneGeometry :args="[0.6 - line * 0.1, 0.04]" />
        <TresMeshBasicMaterial
          :color="'#8B949E'"
          :opacity="0.5"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Central GitHub/Code hub representation -->
    <TresGroup ref="centralRef" :position="[0, 0, -1.5]">
      <!-- Inner glowing core -->
      <TresMesh>
        <TresIcosahedronGeometry :args="[0.4, 1]" />
        <TresMeshStandardMaterial
          :color="'#FFFFFF'"
          :emissive="themeColors.primary"
          :emissive-intensity="0.5"
          :metalness="0.9"
          :roughness="0.1"
        />
      </TresMesh>
      
      <!-- Outer wireframe -->
      <TresMesh>
        <TresOctahedronGeometry :args="[0.7, 1]" />
        <TresMeshBasicMaterial
          :color="themeColors.secondary"
          :wireframe="true"
          :opacity="0.4"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Outer shell -->
      <TresMesh>
        <TresSphereGeometry :args="[0.9, 16, 16]" />
        <TresMeshBasicMaterial
          :color="themeColors.primary"
          :opacity="0.1"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Connection lines from center to cards -->
    <TresMesh 
      v-for="(pos, index) in cardPositions"
      :key="`connection-${index}`"
      :position="[pos.x * 0.3, cardStates[index].y * 0.3, pos.z * 0.3 - 0.5]"
      :rotation="[0, Math.atan2(pos.x, pos.z + 1.5), 0]"
    >
      <TresPlaneGeometry :args="[0.02, 1.5]" />
      <TresMeshBasicMaterial
        :color="index % 2 === 0 ? themeColors.primary : themeColors.secondary"
        :opacity="0.15"
        :transparent="true"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Background star particles -->
  <TresMesh 
    v-for="(star, i) in starParticles" 
    :key="`star-${i}`"
    :position="[star.x, star.y, star.z]"
  >
    <TresSphereGeometry :args="[0.04, 4, 4]" />
    <TresMeshBasicMaterial 
      :color="themeColors.accent" 
      :opacity="0.4" 
      :transparent="true" 
    />
  </TresMesh>
  
  <!-- Floor reflection -->
  <TresMesh :position="[0, -2.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[12, 12]" />
    <TresMeshStandardMaterial
      :color="'#050810'"
      :emissive="themeColors.primary"
      :emissive-intensity="0.02"
      :roughness="0.2"
      :metalness="0.8"
    />
  </TresMesh>
</template>

