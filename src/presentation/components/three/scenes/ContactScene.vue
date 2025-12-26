<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

const sceneRef = ref()
const portalRef = ref()
const innerRingRef = ref()
const outerRingRef = ref()
const envelopeRef = ref()
const particleRefs = Array.from({ length: 8 }, () => ref())

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  
  // Gentle scene sway
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.15) * 0.1
  }
  
  // Portal core pulsing
  if (portalRef.value) {
    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.08
    portalRef.value.scale.set(pulse, pulse, pulse)
  }
  
  // Inner ring rotation
  if (innerRingRef.value) {
    innerRingRef.value.rotation.z = elapsed * 0.3
    innerRingRef.value.rotation.x = Math.sin(elapsed * 0.5) * 0.2
  }
  
  // Outer ring counter-rotation
  if (outerRingRef.value) {
    outerRingRef.value.rotation.z = -elapsed * 0.2
    outerRingRef.value.rotation.y = Math.sin(elapsed * 0.3) * 0.15
  }
  
  // Floating envelope
  if (envelopeRef.value) {
    envelopeRef.value.position.y = 0.8 + Math.sin(elapsed * 0.8) * 0.15
    envelopeRef.value.rotation.y = elapsed * 0.4
    envelopeRef.value.rotation.z = Math.sin(elapsed * 0.6) * 0.1
  }
  
  // Orbiting particles
  particleRefs.forEach((particleRef, i) => {
    if (particleRef.value) {
      const angle = elapsed * 0.4 + (i * Math.PI * 2) / 8
      const radius = 2.2 + Math.sin(elapsed + i) * 0.3
      const yOffset = Math.sin(elapsed * 0.7 + i * 0.5) * 0.5
      particleRef.value.position.x = Math.cos(angle) * radius
      particleRef.value.position.z = Math.sin(angle) * radius
      particleRef.value.position.y = yOffset
    }
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

const segmentCount = computed(() => props.quality === 'high' ? 96 : 32)
</script>

<template>
  <TresPerspectiveCamera :position="[0, 1, 6]" :look-at="[0, 0, 0]" />
  
  <!-- Soft ambient lighting -->
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 0, 2]" :intensity="1.5" color="#A855F7" />
  <TresPointLight :position="[3, 3, 3]" :intensity="0.6" color="#00FF41" />
  <TresPointLight :position="[-3, 2, 2]" :intensity="0.5" color="#3B82F6" />
  
  <TresGroup ref="sceneRef">
    <!-- Central glowing portal/sphere -->
    <TresGroup ref="portalRef">
      <!-- Core glow -->
      <TresMesh>
        <TresSphereGeometry :args="[0.6, segmentCount, segmentCount]" />
        <TresMeshStandardMaterial 
          color="#FFFFFF"
          :emissive="'#A855F7'"
          :emissive-intensity="1"
          :metalness="0.9"
          :roughness="0.1"
        />
      </TresMesh>
      <!-- Soft outer glow -->
      <TresMesh>
        <TresSphereGeometry :args="[0.85, 32, 32]" />
        <TresMeshBasicMaterial color="#A855F7" :opacity="0.2" :transparent="true" />
      </TresMesh>
      <TresMesh>
        <TresSphereGeometry :args="[1.1, 32, 32]" />
        <TresMeshBasicMaterial color="#7C3AED" :opacity="0.1" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Inner rotating ring -->
    <TresGroup ref="innerRingRef">
      <TresMesh>
        <TresTorusGeometry :args="[1.3, 0.04, 16, 64]" />
        <TresMeshStandardMaterial 
          color="#00FF41"
          :emissive="'#00FF41'"
          :emissive-intensity="0.6"
          :metalness="0.8"
          :roughness="0.2"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Outer rotating ring -->
    <TresGroup ref="outerRingRef">
      <TresMesh :rotation="[Math.PI / 3, 0, 0]">
        <TresTorusGeometry :args="[1.8, 0.03, 16, 64]" />
        <TresMeshStandardMaterial 
          color="#3B82F6"
          :emissive="'#3B82F6'"
          :emissive-intensity="0.5"
          :metalness="0.7"
          :roughness="0.3"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Floating envelope (message symbol) -->
    <TresGroup ref="envelopeRef" :position="[0, 0.8, 0]">
      <!-- Envelope body -->
      <TresMesh>
        <TresBoxGeometry :args="[0.5, 0.35, 0.08]" />
        <TresMeshStandardMaterial 
          color="#F8F4E8"
          :roughness="0.9"
          :metalness="0.1"
        />
      </TresMesh>
      <!-- Envelope flap (triangle) -->
      <TresMesh :position="[0, 0.12, 0.045]" :rotation="[Math.PI, 0, 0]">
        <TresConeGeometry :args="[0.28, 0.2, 4]" />
        <TresMeshStandardMaterial 
          color="#EDE8D8"
          :roughness="0.9"
          :metalness="0.1"
        />
      </TresMesh>
      <!-- Seal -->
      <TresMesh :position="[0, 0, 0.05]">
        <TresCylinderGeometry :args="[0.06, 0.06, 0.02, 16]" />
        <TresMeshStandardMaterial 
          color="#A855F7"
          :emissive="'#A855F7'"
          :emissive-intensity="0.4"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Orbiting light particles -->
    <TresMesh 
      v-for="(_, i) in 8" 
      :key="`particle-${i}`"
      :ref="el => particleRefs[i].value = el"
      :position="[Math.cos(i * Math.PI / 4) * 2.2, 0, Math.sin(i * Math.PI / 4) * 2.2]"
    >
      <TresSphereGeometry :args="[0.06, 8, 8]" />
      <TresMeshBasicMaterial 
        :color="i % 2 === 0 ? '#00FF41' : '#A855F7'" 
        :opacity="0.8" 
        :transparent="true" 
      />
    </TresMesh>
    
    <!-- Decorative small stars -->
    <TresMesh 
      v-for="i in 20" 
      :key="`star-${i}`"
      :position="[
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4 - 2
      ]"
    >
      <TresSphereGeometry :args="[0.025, 4, 4]" />
      <TresMeshBasicMaterial color="#FFFFFF" :opacity="0.4" :transparent="true" />
    </TresMesh>
  </TresGroup>
  
  <!-- Subtle floor reflection -->
  <TresMesh :position="[0, -2.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[15, 15]" />
    <TresMeshStandardMaterial 
      color="#0A0A12" 
      :roughness="0.85"
      :metalness="0.15"
    />
  </TresMesh>
</template>
