<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

// Refs for each passion object
const knowledgeRef = ref()
const architectureRef = ref()
const modernizationRef = ref()
const performanceRef = ref()
const frontendRef = ref()
const teamBuildingRef = ref()
const makingRef = ref()
const centerCoreRef = ref()
const orbitRingRef = ref()

// Passion colors from resume data
const passionColors = {
  knowledge: '#FFBF00',
  architecture: '#BD93F9',
  modernization: '#61DAFB',
  performance: '#FFD93D',
  frontend: '#42B883',
  teamBuilding: '#FF6B35',
  making: '#B87333'
}

let animationId: number
let startTime = 0

// Orbit configuration
const orbitRadius = 4.5
const orbitSpeed = 0.15

const getOrbitPosition = (index: number, elapsed: number, totalItems: number = 7) => {
  const angleOffset = (index / totalItems) * Math.PI * 2
  const angle = angleOffset + elapsed * orbitSpeed
  const verticalOffset = Math.sin(elapsed * 0.5 + index) * 0.3
  return {
    x: Math.cos(angle) * orbitRadius,
    y: verticalOffset,
    z: Math.sin(angle) * orbitRadius
  }
}

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000

  // Animate each passion object in orbit
  const refs = [
    knowledgeRef,
    architectureRef,
    modernizationRef,
    performanceRef,
    frontendRef,
    teamBuildingRef,
    makingRef
  ]

  refs.forEach((ref, index) => {
    if (ref.value) {
      const pos = getOrbitPosition(index, elapsed)
      ref.value.position.x = pos.x
      ref.value.position.y = pos.y
      ref.value.position.z = pos.z
      // Individual rotation
      ref.value.rotation.y = elapsed * (0.3 + index * 0.1)
      ref.value.rotation.x = elapsed * 0.2
    }
  })

  // Central core pulsing and rotation
  if (centerCoreRef.value) {
    centerCoreRef.value.rotation.y = elapsed * 0.1
    centerCoreRef.value.rotation.x = elapsed * 0.05
    const pulse = 1 + Math.sin(elapsed * 2) * 0.1
    centerCoreRef.value.scale.set(pulse, pulse, pulse)
  }

  // Orbit ring rotation
  if (orbitRingRef.value) {
    orbitRingRef.value.rotation.z = elapsed * 0.05
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

const segmentCount = computed(() => props.quality === 'high' ? 32 : 16)
</script>

<template>
  <TresPerspectiveCamera :position="[0, 3, 12]" :look-at="[0, 0, 0]" />

  <!-- Enhanced lighting -->
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 0, 0]" :intensity="2" color="#FFFFFF" />
  <TresPointLight :position="[5, 5, 5]" :intensity="0.8" :color="passionColors.knowledge" />
  <TresPointLight :position="[-5, -5, 5]" :intensity="0.8" :color="passionColors.architecture" />
  <TresPointLight :position="[0, -5, -5]" :intensity="0.6" :color="passionColors.frontend" />

  <!-- Central Core - representing the person -->
  <TresGroup ref="centerCoreRef">
    <!-- Inner glowing sphere -->
    <TresMesh>
      <TresSphereGeometry :args="[1, segmentCount, segmentCount]" />
      <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="'#A855F7'" :emissive-intensity="0.8" :metalness="0.9"
        :roughness="0.1" />
    </TresMesh>
    <!-- Outer glow shell -->
    <TresMesh>
      <TresSphereGeometry :args="[1.3, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="'#A855F7'" :opacity="0.15" :transparent="true" />
    </TresMesh>
    <!-- Wireframe accent -->
    <TresMesh>
      <TresIcosahedronGeometry :args="[1.5, 1]" />
      <TresMeshBasicMaterial :color="'#A855F7'" :wireframe="true" :opacity="0.3" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Orbit ring visual -->
  <TresGroup ref="orbitRingRef" :rotation="[Math.PI / 2, 0, 0]">
    <TresMesh>
      <TresTorusGeometry :args="[orbitRadius, 0.02, 8, 64]" />
      <TresMeshBasicMaterial :color="'#A855F7'" :opacity="0.3" :transparent="true" />
    </TresMesh>
    <TresMesh>
      <TresTorusGeometry :args="[orbitRadius, 0.01, 8, 64]" />
      <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 1. Knowledge Sharing - Book/Stack shape (📚) -->
  <TresGroup ref="knowledgeRef">
    <TresMesh>
      <TresBoxGeometry :args="[0.8, 1.0, 0.15]" />
      <TresMeshStandardMaterial :color="passionColors.knowledge" :emissive="passionColors.knowledge"
        :emissive-intensity="0.5" :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[0, 0, 0.2]">
      <TresBoxGeometry :args="[0.75, 0.95, 0.12]" />
      <TresMeshStandardMaterial :color="'#D4A000'" :emissive="passionColors.knowledge" :emissive-intensity="0.3"
        :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[0, 0, 0.35]">
      <TresBoxGeometry :args="[0.7, 0.9, 0.1]" />
      <TresMeshStandardMaterial :color="passionColors.knowledge" :emissive="passionColors.knowledge"
        :emissive-intensity="0.4" :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <!-- Glow halo -->
    <TresMesh>
      <TresSphereGeometry :args="[0.9, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.knowledge" :opacity="0.15" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 2. Architecture - Building/Temple shape (🏗️) -->
  <TresGroup ref="architectureRef">
    <!-- Main pillar -->
    <TresMesh>
      <TresBoxGeometry :args="[0.3, 1.2, 0.3]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.5" :metalness="0.6" :roughness="0.3" />
    </TresMesh>
    <!-- Left pillar -->
    <TresMesh :position="[-0.5, 0, 0]">
      <TresBoxGeometry :args="[0.2, 1.0, 0.2]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.4" :metalness="0.6" :roughness="0.3" />
    </TresMesh>
    <!-- Right pillar -->
    <TresMesh :position="[0.5, 0, 0]">
      <TresBoxGeometry :args="[0.2, 1.0, 0.2]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.4" :metalness="0.6" :roughness="0.3" />
    </TresMesh>
    <!-- Roof -->
    <TresMesh :position="[0, 0.75, 0]">
      <TresBoxGeometry :args="[1.2, 0.15, 0.5]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.5" :metalness="0.7" :roughness="0.2" />
    </TresMesh>
    <!-- Glow -->
    <TresMesh>
      <TresSphereGeometry :args="[1, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.architecture" :opacity="0.12" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 3. Modernization - Circular arrows/refresh shape (🔄) -->
  <TresGroup ref="modernizationRef">
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.6, 0.12, segmentCount, 32, Math.PI * 1.5]" />
      <TresMeshStandardMaterial :color="passionColors.modernization" :emissive="passionColors.modernization"
        :emissive-intensity="0.6" :metalness="0.5" :roughness="0.3" />
    </TresMesh>
    <!-- Arrow head 1 -->
    <TresMesh :position="[0.6, 0, 0]" :rotation="[0, 0, -Math.PI / 4]">
      <TresConeGeometry :args="[0.2, 0.35, 3]" />
      <TresMeshStandardMaterial :color="passionColors.modernization" :emissive="passionColors.modernization"
        :emissive-intensity="0.6" :metalness="0.5" :roughness="0.3" />
    </TresMesh>
    <!-- Inner glow -->
    <TresMesh>
      <TresSphereGeometry :args="[0.4, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.modernization" :opacity="0.25" :transparent="true" />
    </TresMesh>
    <!-- Outer glow -->
    <TresMesh>
      <TresSphereGeometry :args="[0.9, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.modernization" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 4. Performance - Lightning bolt shape (⚡) -->
  <TresGroup ref="performanceRef">
    <!-- Main bolt segment -->
    <TresMesh :rotation="[0, 0, Math.PI / 6]">
      <TresBoxGeometry :args="[0.25, 0.8, 0.1]" />
      <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
        :emissive-intensity="0.8" :metalness="0.8" :roughness="0.1" />
    </TresMesh>
    <!-- Middle segment -->
    <TresMesh :position="[0.15, -0.1, 0]" :rotation="[0, 0, -Math.PI / 6]">
      <TresBoxGeometry :args="[0.2, 0.6, 0.1]" />
      <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
        :emissive-intensity="0.8" :metalness="0.8" :roughness="0.1" />
    </TresMesh>
    <!-- Bottom segment -->
    <TresMesh :position="[0.35, -0.5, 0]" :rotation="[0, 0, Math.PI / 6]">
      <TresBoxGeometry :args="[0.15, 0.5, 0.08]" />
      <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
        :emissive-intensity="0.9" :metalness="0.9" :roughness="0.05" />
    </TresMesh>
    <!-- Electric glow -->
    <TresMesh>
      <TresSphereGeometry :args="[0.8, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.performance" :opacity="0.2" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 5. Frontend - Palette/brush shape (🎨) -->
  <TresGroup ref="frontendRef">
    <!-- Palette base -->
    <TresMesh :rotation="[0, 0, Math.PI / 8]">
      <TresTorusGeometry :args="[0.5, 0.25, segmentCount, 32]" />
      <TresMeshStandardMaterial :color="passionColors.frontend" :emissive="passionColors.frontend"
        :emissive-intensity="0.5" :metalness="0.4" :roughness="0.4" />
    </TresMesh>
    <!-- Color dots -->
    <TresMesh :position="[0.3, 0.3, 0.2]">
      <TresSphereGeometry :args="[0.12, 16, 16]" />
      <TresMeshStandardMaterial :color="'#FF6B6B'" :emissive="'#FF6B6B'" :emissive-intensity="0.5" />
    </TresMesh>
    <TresMesh :position="[-0.3, 0.3, 0.2]">
      <TresSphereGeometry :args="[0.12, 16, 16]" />
      <TresMeshStandardMaterial :color="'#4ECDC4'" :emissive="'#4ECDC4'" :emissive-intensity="0.5" />
    </TresMesh>
    <TresMesh :position="[0, -0.35, 0.2]">
      <TresSphereGeometry :args="[0.12, 16, 16]" />
      <TresMeshStandardMaterial :color="'#FFE66D'" :emissive="'#FFE66D'" :emissive-intensity="0.5" />
    </TresMesh>
    <!-- Glow -->
    <TresMesh>
      <TresSphereGeometry :args="[0.9, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.frontend" :opacity="0.12" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 6. Team Building - People/group shape (👥) -->
  <TresGroup ref="teamBuildingRef">
    <!-- Central person -->
    <TresMesh :position="[0, 0.3, 0]">
      <TresSphereGeometry :args="[0.25, segmentCount, segmentCount]" />
      <TresMeshStandardMaterial :color="passionColors.teamBuilding" :emissive="passionColors.teamBuilding"
        :emissive-intensity="0.6" :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[0, -0.2, 0]">
      <TresCapsuleGeometry :args="[0.2, 0.4, 4, 16]" />
      <TresMeshStandardMaterial :color="passionColors.teamBuilding" :emissive="passionColors.teamBuilding"
        :emissive-intensity="0.5" :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <!-- Left person (smaller) -->
    <TresMesh :position="[-0.5, 0.2, -0.2]">
      <TresSphereGeometry :args="[0.18, 16, 16]" />
      <TresMeshStandardMaterial :color="'#FF8C5A'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.4"
        :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[-0.5, -0.15, -0.2]">
      <TresCapsuleGeometry :args="[0.15, 0.3, 4, 16]" />
      <TresMeshStandardMaterial :color="'#FF8C5A'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.4"
        :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <!-- Right person (smaller) -->
    <TresMesh :position="[0.5, 0.2, -0.2]">
      <TresSphereGeometry :args="[0.18, 16, 16]" />
      <TresMeshStandardMaterial :color="'#FFB085'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.4"
        :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[0.5, -0.15, -0.2]">
      <TresCapsuleGeometry :args="[0.15, 0.3, 4, 16]" />
      <TresMeshStandardMaterial :color="'#FFB085'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.4"
        :metalness="0.3" :roughness="0.5" />
    </TresMesh>
    <!-- Team glow -->
    <TresMesh>
      <TresSphereGeometry :args="[1, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.teamBuilding" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 7. Making - Wrench/gear shape (🔧) -->
  <TresGroup ref="makingRef">
    <!-- Gear -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.4, 0.15, 6, 8]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.4"
        :metalness="0.8" :roughness="0.3" />
    </TresMesh>
    <!-- Gear teeth represented by outer ring -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.55, 0.08, 8, 12]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.5"
        :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Center bolt -->
    <TresMesh>
      <TresCylinderGeometry :args="[0.15, 0.15, 0.3, 6]" />
      <TresMeshStandardMaterial :color="'#8B5A2B'" :emissive="passionColors.making" :emissive-intensity="0.3"
        :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Wrench handle -->
    <TresMesh :position="[0.7, 0, 0]" :rotation="[0, 0, 0]">
      <TresBoxGeometry :args="[0.8, 0.12, 0.08]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.4"
        :metalness="0.7" :roughness="0.4" />
    </TresMesh>
    <!-- Glow -->
    <TresMesh>
      <TresSphereGeometry :args="[0.9, 16, 16]" />
      <TresMeshBasicMaterial :color="passionColors.making" :opacity="0.12" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Ambient particles / star field background -->
  <TresMesh v-for="i in 30" :key="i" :position="[
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 10 - 5
  ]">
    <TresSphereGeometry :args="[0.03, 4, 4]" />
    <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.5" :transparent="true" />
  </TresMesh>
</template>
