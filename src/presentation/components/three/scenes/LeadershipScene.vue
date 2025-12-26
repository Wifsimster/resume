<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const groupRef = ref()

// Team member positions around a table
const teamPositions = [
  { x: 0, y: 0, z: 2, color: '#FF6B35' },     // Leader (you)
  { x: -1.5, y: 0, z: 1, color: '#42B883' },  // Hugo
  { x: 1.5, y: 0, z: 1, color: '#61DAFB' },   // Marion
  { x: -2, y: 0, z: -0.5, color: '#BD93F9' }, // Team member
  { x: 2, y: 0, z: -0.5, color: '#FFD93D' },  // Team member
]

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  if (groupRef.value) {
    groupRef.value.rotation.y = Math.sin(elapsed * 0.1) * 0.05
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
  <TresPerspectiveCamera :position="[0, 5, 8]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 5, 0]" :intensity="1" color="#FFFFFF" />
  <TresPointLight :position="[0, 2, 0]" :intensity="0.5" color="#FF6B35" />
  
  <TresGroup ref="groupRef">
    <!-- Round table -->
    <TresMesh :position="[0, -0.1, 0]">
      <TresCylinderGeometry :args="[2.5, 2.5, 0.2, quality === 'high' ? 32 : 16]" />
      <TresMeshStandardMaterial
        :color="'#3D2B1F'"
        :roughness="0.8"
        :metalness="0.2"
      />
    </TresMesh>
    
    <!-- Team members (abstract figures) -->
    <TresGroup 
      v-for="(member, index) in teamPositions" 
      :key="index"
      :position="[member.x, 0.5, member.z]"
    >
      <!-- Body -->
      <TresMesh :position="[0, 0, 0]">
        <TresCapsuleGeometry :args="[0.2, 0.5, 8, 16]" />
        <TresMeshStandardMaterial
          :color="member.color"
          :emissive="member.color"
          :emissive-intensity="0.1"
          :roughness="0.5"
        />
      </TresMesh>
      <!-- Head -->
      <TresMesh :position="[0, 0.55, 0]">
        <TresSphereGeometry :args="[0.15, 16, 16]" />
        <TresMeshStandardMaterial
          :color="member.color"
          :roughness="0.5"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Knowledge flow particles (center) -->
    <TresMesh :position="[0, 1, 0]">
      <TresOctahedronGeometry :args="[0.3, 0]" />
      <TresMeshBasicMaterial
        :color="'#00FF41'"
        :wireframe="true"
      />
    </TresMesh>
    
    <!-- Whiteboard behind -->
    <TresMesh :position="[0, 1.5, -3]">
      <TresBoxGeometry :args="[4, 2, 0.1]" />
      <TresMeshStandardMaterial
        :color="'#FFFFFF'"
        :roughness="0.9"
      />
    </TresMesh>
    
    <!-- Whiteboard frame -->
    <TresMesh :position="[0, 1.5, -2.95]">
      <TresBoxGeometry :args="[4.2, 2.2, 0.05]" />
      <TresMeshStandardMaterial
        :color="'#2D2B1F'"
        :roughness="0.8"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -0.2, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[15, 15]" />
    <TresMeshStandardMaterial
      :color="'#1A1410'"
      :roughness="0.9"
    />
  </TresMesh>
</template>

