<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const groupRef = ref()
const knowledgeRef = ref()
const memberRefs = ref<any[]>([])

// Team member positions around a table
const teamPositions = [
  { x: 0, y: 0, z: 2, color: '#FF6B35', role: 'leader' },     // Leader (you)
  { x: -1.5, y: 0, z: 1, color: '#42B883', role: 'member' },  // Hugo
  { x: 1.5, y: 0, z: 1, color: '#61DAFB', role: 'member' },   // Marion
  { x: -2, y: 0, z: -0.5, color: '#BD93F9', role: 'member' }, // Team member
  { x: 2, y: 0, z: -0.5, color: '#FFD93D', role: 'member' },  // Team member
]

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000

  // Gentle scene rotation
  if (groupRef.value) {
    groupRef.value.rotation.y = Math.sin(elapsed * 0.15) * 0.1
  }

  // Animate knowledge octahedron - spinning and floating
  if (knowledgeRef.value) {
    knowledgeRef.value.rotation.y = elapsed * 0.8
    knowledgeRef.value.rotation.x = elapsed * 0.5
    knowledgeRef.value.position.y = 1.2 + Math.sin(elapsed * 2) * 0.2
    const pulse = 1 + Math.sin(elapsed * 3) * 0.15
    knowledgeRef.value.scale.set(pulse, pulse, pulse)
  }

  // Animate team members - subtle breathing/bobbing
  memberRefs.value.forEach((memberRef, index) => {
    if (memberRef) {
      const offset = index * 0.5
      memberRef.position.y = 0.5 + Math.sin(elapsed * 1.5 + offset) * 0.05
      // Leader has special rotation toward the center
      if (index === 0) {
        memberRef.rotation.y = Math.sin(elapsed * 0.3) * 0.1
      }
    }
  })

  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  startTime = Date.now()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

const setMemberRef = (el: any, index: number) => {
  if (el) {
    memberRefs.value[index] = el
  }
}
</script>

<template>
  <TresPerspectiveCamera :position="[0, 5, 8]" :look-at="[0, 0, 0]" />
  
  <!-- Enhanced lighting -->
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 6, 0]" :intensity="1.2" color="#FFFFFF" />
  <TresPointLight :position="[0, 2, 0]" :intensity="0.8" color="#FF6B35" />
  <TresPointLight :position="[-3, 3, 3]" :intensity="0.5" color="#42B883" />
  <TresPointLight :position="[3, 3, 3]" :intensity="0.5" color="#61DAFB" />
  
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
    
    <!-- Table glow ring -->
    <TresMesh :position="[0, 0, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[2.6, 0.03, 8, 64]" />
      <TresMeshBasicMaterial :color="'#FF6B35'" :opacity="0.5" :transparent="true" />
    </TresMesh>
    
    <!-- Team members (abstract figures) -->
    <TresGroup 
      v-for="(member, index) in teamPositions" 
      :key="index"
      :ref="(el) => setMemberRef(el, index)"
      :position="[member.x, 0.5, member.z]"
    >
      <!-- Body -->
      <TresMesh :position="[0, 0, 0]">
        <TresCapsuleGeometry :args="[0.2, 0.5, 8, 16]" />
        <TresMeshStandardMaterial
          :color="member.color"
          :emissive="member.color"
          :emissive-intensity="member.role === 'leader' ? 0.3 : 0.15"
          :roughness="0.5"
          :metalness="0.3"
        />
      </TresMesh>
      <!-- Head -->
      <TresMesh :position="[0, 0.55, 0]">
        <TresSphereGeometry :args="[0.15, 16, 16]" />
        <TresMeshStandardMaterial
          :color="member.color"
          :emissive="member.color"
          :emissive-intensity="0.2"
          :roughness="0.5"
        />
      </TresMesh>
      <!-- Glow aura for leader -->
      <TresMesh v-if="member.role === 'leader'" :position="[0, 0.2, 0]">
        <TresSphereGeometry :args="[0.5, 16, 16]" />
        <TresMeshBasicMaterial :color="member.color" :opacity="0.1" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Knowledge flow octahedron (center) - animated -->
    <TresGroup ref="knowledgeRef" :position="[0, 1.2, 0]">
      <!-- Main octahedron -->
      <TresMesh>
        <TresOctahedronGeometry :args="[0.35, 0]" />
        <TresMeshStandardMaterial
          :color="'#00FF41'"
          :emissive="'#00FF41'"
          :emissive-intensity="0.6"
          :metalness="0.8"
          :roughness="0.2"
        />
      </TresMesh>
      <!-- Wireframe outer -->
      <TresMesh>
        <TresOctahedronGeometry :args="[0.5, 0]" />
        <TresMeshBasicMaterial :color="'#00FF41'" :wireframe="true" :opacity="0.5" :transparent="true" />
      </TresMesh>
      <!-- Glow sphere -->
      <TresMesh>
        <TresSphereGeometry :args="[0.6, 16, 16]" />
        <TresMeshBasicMaterial :color="'#00FF41'" :opacity="0.1" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Connection lines from knowledge to team members -->
    <TresMesh 
      v-for="(member, index) in teamPositions" 
      :key="'line-' + index"
      :position="[member.x / 2, 0.85, member.z / 2]"
      :rotation="[0, Math.atan2(member.x, member.z), 0]"
    >
      <TresBoxGeometry :args="[0.02, 0.02, Math.sqrt(member.x * member.x + member.z * member.z) * 0.5]" />
      <TresMeshBasicMaterial :color="member.color" :opacity="0.3" :transparent="true" />
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
    <TresMesh :position="[0, 1.5, -3.1]">
      <TresBoxGeometry :args="[4.2, 2.2, 0.05]" />
      <TresMeshStandardMaterial
        :color="'#2D2B1F'"
        :roughness="0.8"
      />
    </TresMesh>
    
    <!-- Whiteboard content markers -->
    <TresMesh :position="[-1.2, 1.8, -2.94]">
      <TresBoxGeometry :args="[1.5, 0.08, 0.01]" />
      <TresMeshBasicMaterial :color="'#FF6B35'" />
    </TresMesh>
    <TresMesh :position="[-0.8, 1.5, -2.94]">
      <TresBoxGeometry :args="[2, 0.06, 0.01]" />
      <TresMeshBasicMaterial :color="'#333333'" />
    </TresMesh>
    <TresMesh :position="[-0.6, 1.25, -2.94]">
      <TresBoxGeometry :args="[1.8, 0.06, 0.01]" />
      <TresMeshBasicMaterial :color="'#333333'" />
    </TresMesh>
    <TresMesh :position="[1, 1.6, -2.94]">
      <TresBoxGeometry :args="[0.6, 0.6, 0.01]" />
      <TresMeshBasicMaterial :color="'#42B883'" :opacity="0.3" :transparent="true" />
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
  
  <!-- Ambient particles -->
  <TresMesh v-for="i in 15" :key="'particle-' + i" :position="[
    (Math.random() - 0.5) * 12,
    Math.random() * 5 + 1,
    (Math.random() - 0.5) * 8
  ]">
    <TresSphereGeometry :args="[0.03, 4, 4]" />
    <TresMeshBasicMaterial :color="'#FF6B35'" :opacity="0.4" :transparent="true" />
  </TresMesh>
</template>

