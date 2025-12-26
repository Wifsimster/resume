<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, computed } from 'vue'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three'
import {
  TresPerspectiveCamera,
  TresAmbientLight,
  TresDirectionalLight,
  TresPointLight,
  TresGroup,
  TresMesh,
  TresIcosahedronGeometry,
  TresSphereGeometry,
  TresRingGeometry,
  TresMeshStandardMaterial,
  TresMeshBasicMaterial
} from '@tresjs/core'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

// Passion sphere positions (7 spheres in a circle + gaming controller)
const passionPositions = [
  { x: 0, y: 0, z: 0, color: '#7C3AED', icon: '📚' },      // Knowledge - center (purple)
  { x: 2, y: 1, z: 0, color: '#A855F7', icon: '🏗️' },     // Architecture
  { x: 1.5, y: -1, z: 1.5, color: '#6366F1', icon: '🔄' }, // Modernization (indigo)
  { x: -1.5, y: 1.5, z: 1, color: '#FBBF24', icon: '⚡' }, // Performance (amber)
  { x: -2, y: 0, z: 0.5, color: '#8B5CF6', icon: '🎨' },   // Frontend (violet)
  { x: -1, y: -1.5, z: -1, color: '#F97316', icon: '👥' }, // Team Building (orange)
  { x: 1.5, y: 0.5, z: -1.5, color: '#EC4899', icon: '🔧' }, // Making (pink)
  { x: 0, y: 2, z: -0.5, color: '#3B82F6', icon: '🎮' }    // Gaming (blue)
]

// Animation
const groupRef = ref()
let animationId: number | null = null
let isAnimating = false

const animate = () => {
  if (groupRef.value && isAnimating) {
    groupRef.value.rotation.y += 0.002
    animationId = requestAnimationFrame(animate)
  }
}

// Start animation when ref becomes available
watchEffect(() => {
  if (groupRef.value && !isAnimating) {
    isAnimating = true
    animate()
  }
})

onUnmounted(() => {
  isAnimating = false
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  // Clean up particles resources
  if (particles.value) {
    particles.value.geometry.dispose()
    particles.value.material.dispose()
  }
})

// Star positions for particles (200 points * 3 coordinates = 600 values)
const starPositions = (() => {
  const positions = new Float32Array(200 * 3)
  for (let i = 0; i < 200; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  return positions
})()

// Create particles using primitive approach
const particles = computed(() => {
  if (props.quality !== 'high') return null
  
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  
  const material = new PointsMaterial({
    color: 0xFFFFFF,
    size: 0.02,
    opacity: 0.5,
    transparent: true
  })
  
  return new Points(geometry, material)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />
  
  <!-- Ambient lighting -->
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
  <TresPointLight :position="[-3, 3, 3]" :intensity="0.5" color="#7C3AED" />
  
  <!-- Passion spheres group -->
  <TresGroup ref="groupRef">
    <!-- Central knowledge sphere -->
    <TresMesh :position="[0, 0, 0]">
      <TresIcosahedronGeometry :args="[0.8, quality === 'high' ? 2 : 1]" />
      <TresMeshStandardMaterial
        :color="'#7C3AED'"
        :emissive="'#7C3AED'"
        :emissive-intensity="0.3"
        :roughness="0.3"
        :metalness="0.7"
      />
    </TresMesh>
    
    <!-- Orbiting passion spheres -->
    <TresMesh
      v-for="(passion, index) in passionPositions.slice(1)"
      :key="index"
      :position="[passion.x, passion.y, passion.z]"
    >
      <TresSphereGeometry :args="[0.25, quality === 'high' ? 32 : 16, quality === 'high' ? 32 : 16]" />
      <TresMeshStandardMaterial
        :color="passion.color"
        :emissive="passion.color"
        :emissive-intensity="0.2"
        :roughness="0.4"
        :metalness="0.6"
      />
    </TresMesh>
    
    <!-- Connecting lines (particle-like) -->
    <TresMesh
      v-for="(_, index) in passionPositions.slice(1)"
      :key="`line-${index}`"
      :position="[0, 0, 0]"
    >
      <TresRingGeometry :args="[1.8 + index * 0.2, 1.85 + index * 0.2, quality === 'high' ? 64 : 32]" />
      <TresMeshBasicMaterial
        :color="'#7C3AED'"
        :opacity="0.1"
        :transparent="true"
        :side="2"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Background stars/particles -->
  <primitive v-if="particles" :object="particles" />
</template>

