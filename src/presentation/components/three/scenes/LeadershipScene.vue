<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

const groupRef = ref()
const knowledgeRef = ref()
const knowledgeInnerRef = ref()
const knowledgeOuterRef = ref()
const tableGlowRef = ref()
const memberRefs = ref<any[]>([])
const connectionRefs = ref<any[]>([])
const particleRefs = ref<any[]>([])
const energyOrbRefs = ref<any[]>([])

// Team member positions around a table - adjusted for better camera view
const teamPositions = [
  { x: 0, y: 0, z: 2.2, color: '#FF6B35', role: 'leader', name: 'Leader' },
  { x: -1.8, y: 0, z: 0.8, color: '#42B883', role: 'member', name: 'Dev 1' },
  { x: 1.8, y: 0, z: 0.8, color: '#61DAFB', role: 'member', name: 'Dev 2' },
  { x: -2.2, y: 0, z: -0.8, color: '#BD93F9', role: 'member', name: 'Dev 3' },
  { x: 2.2, y: 0, z: -0.8, color: '#FFD93D', role: 'member', name: 'Dev 4' },
]

// Energy orbs that travel between knowledge and members
const energyOrbs = computed(() => 
  teamPositions.map((_, i) => ({ index: i, offset: i * 0.8 }))
)

// Floating particles configuration
const particles = computed(() => {
  const count = props.quality === 'high' ? 25 : 12
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    baseX: (Math.random() - 0.5) * 14,
    baseY: Math.random() * 4 + 1,
    baseZ: (Math.random() - 0.5) * 10,
    speed: 0.3 + Math.random() * 0.5,
    amplitude: 0.3 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    color: ['#FF6B35', '#42B883', '#61DAFB', '#BD93F9', '#00FF41'][Math.floor(Math.random() * 5)]
  }))
})

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000

  // Smooth scene rotation - slightly offset to show more of the right side
  if (groupRef.value) {
    groupRef.value.rotation.y = Math.sin(elapsed * 0.12) * 0.15 + 0.2
  }

  // Table glow pulsing
  if (tableGlowRef.value) {
    const glowPulse = 0.4 + Math.sin(elapsed * 2) * 0.15
    tableGlowRef.value.material.opacity = glowPulse
  }

  // Animate knowledge octahedron - complex spinning
  if (knowledgeRef.value) {
    knowledgeRef.value.position.y = 1.5 + Math.sin(elapsed * 1.5) * 0.25
  }
  
  if (knowledgeInnerRef.value) {
    knowledgeInnerRef.value.rotation.y = elapsed * 1.2
    knowledgeInnerRef.value.rotation.x = elapsed * 0.8
    const innerPulse = 1 + Math.sin(elapsed * 4) * 0.1
    knowledgeInnerRef.value.scale.set(innerPulse, innerPulse, innerPulse)
  }
  
  if (knowledgeOuterRef.value) {
    knowledgeOuterRef.value.rotation.y = -elapsed * 0.6
    knowledgeOuterRef.value.rotation.z = elapsed * 0.4
  }

  // Animate team members - breathing, bobbing, and looking toward center
  memberRefs.value.forEach((memberRef, index) => {
    if (memberRef) {
      const offset = index * 0.7
      const member = teamPositions[index]
      
      // Breathing/bobbing motion
      memberRef.position.y = 0.5 + Math.sin(elapsed * 1.2 + offset) * 0.08
      
      // Subtle lean toward center (knowledge sharing moment)
      const leanAngle = Math.sin(elapsed * 0.5 + offset) * 0.05
      memberRef.rotation.x = leanAngle
      
      // Head turning toward knowledge (simulated engagement)
      const turnToCenter = Math.atan2(-member.x, -member.z)
      const engagementWobble = Math.sin(elapsed * 0.8 + offset) * 0.1
      memberRef.rotation.y = turnToCenter + engagementWobble
      
      // Leader has extra presence animation
      if (member.role === 'leader') {
        const leaderPulse = 1 + Math.sin(elapsed * 2) * 0.03
        memberRef.scale.set(leaderPulse, leaderPulse, leaderPulse)
      }
    }
  })

  // Animate energy orbs traveling from knowledge to members
  energyOrbRefs.value.forEach((orbRef, index) => {
    if (orbRef) {
      const member = teamPositions[index]
      const cycleTime = 3
      const t = ((elapsed + energyOrbs.value[index].offset) % cycleTime) / cycleTime
      
      // Smooth easing function
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      
      // Travel from center (knowledge) to member
      orbRef.position.x = member.x * easeT
      orbRef.position.y = 1.5 - (1.5 - 0.8) * easeT + Math.sin(t * Math.PI) * 0.5
      orbRef.position.z = member.z * easeT
      
      // Pulse size and opacity based on position
      const orbScale = 0.08 + Math.sin(t * Math.PI) * 0.04
      orbRef.scale.set(orbScale, orbScale, orbScale)
      
      // Fade near endpoints
      const fadeOpacity = Math.sin(t * Math.PI) * 0.8
      if (orbRef.material) {
        orbRef.material.opacity = fadeOpacity
      }
    }
  })

  // Animate connection beams pulsing
  connectionRefs.value.forEach((connRef, index) => {
    if (connRef && connRef.material) {
      const pulseOffset = index * 0.5
      connRef.material.opacity = 0.15 + Math.sin(elapsed * 3 + pulseOffset) * 0.1
    }
  })

  // Animate floating particles
  particleRefs.value.forEach((particleRef, index) => {
    if (particleRef) {
      const p = particles.value[index]
      particleRef.position.x = p.baseX + Math.sin(elapsed * p.speed + p.phase) * p.amplitude
      particleRef.position.y = p.baseY + Math.cos(elapsed * p.speed * 0.7 + p.phase) * p.amplitude * 0.5
      particleRef.position.z = p.baseZ + Math.sin(elapsed * p.speed * 0.5 + p.phase * 2) * p.amplitude * 0.3
      
      // Twinkle effect
      const twinkle = 0.3 + Math.sin(elapsed * 4 + p.phase) * 0.2
      if (particleRef.material) {
        particleRef.material.opacity = twinkle
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
  if (el) memberRefs.value[index] = el
}

const setConnectionRef = (el: any, index: number) => {
  if (el) connectionRefs.value[index] = el
}

const setParticleRef = (el: any, index: number) => {
  if (el) particleRefs.value[index] = el
}

const setEnergyOrbRef = (el: any, index: number) => {
  if (el) energyOrbRefs.value[index] = el
}

const segmentCount = computed(() => props.quality === 'high' ? 32 : 16)
</script>

<template>
  <!-- Camera positioned to show scene on the right side -->
  <TresPerspectiveCamera :position="[3, 4.5, 9]" :look-at="[0.5, 0.5, 0]" />
  
  <!-- Enhanced multi-point lighting -->
  <TresAmbientLight :intensity="0.35" />
  <TresPointLight :position="[0, 5, 0]" :intensity="1.5" color="#FFFFFF" />
  <TresPointLight :position="[0, 2, 0]" :intensity="1" color="#00FF41" :distance="6" />
  <TresPointLight :position="[-4, 3, 2]" :intensity="0.6" color="#42B883" />
  <TresPointLight :position="[4, 3, 2]" :intensity="0.6" color="#61DAFB" />
  <TresPointLight :position="[0, 1, 4]" :intensity="0.8" color="#FF6B35" />
  
  <TresGroup ref="groupRef">
    <!-- Round table with reflective surface -->
    <TresMesh :position="[0, -0.1, 0]">
      <TresCylinderGeometry :args="[2.8, 2.8, 0.15, segmentCount]" />
      <TresMeshStandardMaterial
        :color="'#1A1410'"
        :roughness="0.4"
        :metalness="0.6"
      />
    </TresMesh>
    
    <!-- Table top accent ring -->
    <TresMesh :position="[0, 0.02, 0]">
      <TresCylinderGeometry :args="[2.75, 2.75, 0.02, segmentCount]" />
      <TresMeshStandardMaterial
        :color="'#2D2520'"
        :roughness="0.3"
        :metalness="0.7"
      />
    </TresMesh>
    
    <!-- Table glow ring - animated -->
    <TresMesh ref="tableGlowRef" :position="[0, 0.05, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[2.9, 0.04, 8, 64]" />
      <TresMeshBasicMaterial :color="'#FF6B35'" :opacity="0.5" :transparent="true" />
    </TresMesh>
    
    <!-- Inner table glow -->
    <TresMesh :position="[0, 0.05, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[1.5, 0.02, 8, 48]" />
      <TresMeshBasicMaterial :color="'#00FF41'" :opacity="0.3" :transparent="true" />
    </TresMesh>
    
    <!-- Team members (abstract figures) -->
    <TresGroup 
      v-for="(member, index) in teamPositions" 
      :key="index"
      :ref="(el) => setMemberRef(el, index)"
      :position="[member.x, 0.5, member.z]"
    >
      <!-- Body - more detailed -->
      <TresMesh :position="[0, 0, 0]">
        <TresCapsuleGeometry :args="[0.22, 0.55, 8, segmentCount]" />
        <TresMeshStandardMaterial
          :color="member.color"
          :emissive="member.color"
          :emissive-intensity="member.role === 'leader' ? 0.4 : 0.2"
          :roughness="0.4"
          :metalness="0.4"
        />
      </TresMesh>
      
      <!-- Head -->
      <TresMesh :position="[0, 0.58, 0]">
        <TresSphereGeometry :args="[0.16, segmentCount, segmentCount]" />
        <TresMeshStandardMaterial
          :color="member.color"
          :emissive="member.color"
          :emissive-intensity="0.25"
          :roughness="0.4"
        />
      </TresMesh>
      
      <!-- Glow aura for all members - stronger for leader -->
      <TresMesh :position="[0, 0.25, 0]">
        <TresSphereGeometry :args="[member.role === 'leader' ? 0.6 : 0.45, 16, 16]" />
        <TresMeshBasicMaterial 
          :color="member.color" 
          :opacity="member.role === 'leader' ? 0.15 : 0.08" 
          :transparent="true" 
        />
      </TresMesh>
      
      <!-- Leader crown ring -->
      <TresMesh v-if="member.role === 'leader'" :position="[0, 0.78, 0]" :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.12, 0.02, 8, 16]" />
        <TresMeshBasicMaterial :color="'#FFD700'" :opacity="0.7" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Knowledge flow octahedron (center) - enhanced -->
    <TresGroup ref="knowledgeRef" :position="[0, 1.5, 0]">
      <!-- Core inner octahedron -->
      <TresMesh ref="knowledgeInnerRef">
        <TresOctahedronGeometry :args="[0.4, 0]" />
        <TresMeshStandardMaterial
          :color="'#00FF41'"
          :emissive="'#00FF41'"
          :emissive-intensity="0.8"
          :metalness="0.9"
          :roughness="0.1"
        />
      </TresMesh>
      
      <!-- Wireframe outer shell -->
      <TresMesh ref="knowledgeOuterRef">
        <TresIcosahedronGeometry :args="[0.65, 1]" />
        <TresMeshBasicMaterial :color="'#00FF41'" :wireframe="true" :opacity="0.4" :transparent="true" />
      </TresMesh>
      
      <!-- Second rotating wireframe -->
      <TresMesh :rotation="[Math.PI / 4, 0, Math.PI / 4]">
        <TresOctahedronGeometry :args="[0.55, 0]" />
        <TresMeshBasicMaterial :color="'#42B883'" :wireframe="true" :opacity="0.25" :transparent="true" />
      </TresMesh>
      
      <!-- Glow layers -->
      <TresMesh>
        <TresSphereGeometry :args="[0.5, 16, 16]" />
        <TresMeshBasicMaterial :color="'#00FF41'" :opacity="0.2" :transparent="true" />
      </TresMesh>
      <TresMesh>
        <TresSphereGeometry :args="[0.8, 16, 16]" />
        <TresMeshBasicMaterial :color="'#00FF41'" :opacity="0.08" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Energy orbs traveling to team members -->
    <TresMesh 
      v-for="(_orb, index) in energyOrbs" 
      :key="'orb-' + index"
      :ref="(el) => setEnergyOrbRef(el, index)"
      :position="[0, 1.5, 0]"
    >
      <TresSphereGeometry :args="[0.1, 8, 8]" />
      <TresMeshBasicMaterial 
        :color="teamPositions[index].color" 
        :opacity="0.8" 
        :transparent="true" 
      />
    </TresMesh>
    
    <!-- Connection beams from knowledge to team members -->
    <TresMesh 
      v-for="(member, index) in teamPositions" 
      :key="'beam-' + index"
      :ref="(el) => setConnectionRef(el, index)"
      :position="[member.x / 2, 1.0, member.z / 2]"
      :rotation="[
        Math.atan2(Math.sqrt(member.x * member.x + member.z * member.z), 1),
        Math.atan2(member.x, member.z),
        0
      ]"
    >
      <TresCylinderGeometry :args="[0.015, 0.015, Math.sqrt(member.x * member.x + member.z * member.z + 1) * 0.6, 8]" />
      <TresMeshBasicMaterial :color="member.color" :opacity="0.2" :transparent="true" />
    </TresMesh>
    
    <!-- Whiteboard behind - more detailed -->
    <TresGroup :position="[0, 1.6, -3.5]">
      <!-- Whiteboard frame -->
      <TresMesh :position="[0, 0, -0.08]">
        <TresBoxGeometry :args="[4.4, 2.4, 0.08]" />
        <TresMeshStandardMaterial :color="'#1A1410'" :roughness="0.7" :metalness="0.3" />
      </TresMesh>
      
      <!-- Whiteboard surface -->
      <TresMesh>
        <TresBoxGeometry :args="[4, 2, 0.05]" />
        <TresMeshStandardMaterial :color="'#F5F5F5'" :roughness="0.95" />
      </TresMesh>
      
      <!-- Content markers - title -->
      <TresMesh :position="[-1.2, 0.65, 0.03]">
        <TresBoxGeometry :args="[1.8, 0.1, 0.01]" />
        <TresMeshBasicMaterial :color="'#FF6B35'" />
      </TresMesh>
      
      <!-- Content markers - bullet points -->
      <TresMesh :position="[-0.9, 0.3, 0.03]">
        <TresBoxGeometry :args="[2.2, 0.06, 0.01]" />
        <TresMeshBasicMaterial :color="'#333333'" />
      </TresMesh>
      <TresMesh :position="[-0.7, 0.05, 0.03]">
        <TresBoxGeometry :args="[2, 0.06, 0.01]" />
        <TresMeshBasicMaterial :color="'#333333'" />
      </TresMesh>
      <TresMesh :position="[-0.85, -0.2, 0.03]">
        <TresBoxGeometry :args="[2.1, 0.06, 0.01]" />
        <TresMeshBasicMaterial :color="'#333333'" />
      </TresMesh>
      
      <!-- Diagram area -->
      <TresMesh :position="[1.2, 0.2, 0.03]">
        <TresBoxGeometry :args="[0.8, 0.8, 0.01]" />
        <TresMeshBasicMaterial :color="'#42B883'" :opacity="0.25" :transparent="true" />
      </TresMesh>
      <TresMesh :position="[1.2, 0.2, 0.035]" :rotation="[0, 0, Math.PI / 4]">
        <TresBoxGeometry :args="[0.5, 0.5, 0.005]" />
        <TresMeshBasicMaterial :color="'#42B883'" :opacity="0.4" :transparent="true" />
      </TresMesh>
      
      <!-- Checkmark -->
      <TresMesh :position="[-1.7, 0.3, 0.03]">
        <TresBoxGeometry :args="[0.08, 0.08, 0.01]" />
        <TresMeshBasicMaterial :color="'#00FF41'" />
      </TresMesh>
      <TresMesh :position="[-1.7, 0.05, 0.03]">
        <TresBoxGeometry :args="[0.08, 0.08, 0.01]" />
        <TresMeshBasicMaterial :color="'#00FF41'" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
  
  <!-- Floor with subtle grid -->
  <TresMesh :position="[0, -0.25, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[20, 20]" />
    <TresMeshStandardMaterial :color="'#0A0808'" :roughness="0.95" />
  </TresMesh>
  
  <!-- Animated floating particles -->
  <TresMesh 
    v-for="p in particles" 
    :key="'particle-' + p.id"
    :ref="(el) => setParticleRef(el, p.id)"
    :position="[p.baseX, p.baseY, p.baseZ]"
  >
    <TresSphereGeometry :args="[0.04, 6, 6]" />
    <TresMeshBasicMaterial :color="p.color" :opacity="0.4" :transparent="true" />
  </TresMesh>
</template>

