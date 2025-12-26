<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, shallowRef, watch } from 'vue'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial, AdditiveBlending } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

const sceneRef = ref()
const hubRef = ref()
const innerHubRef = ref()
const contactCardRefs = Array.from({ length: 4 }, () => ref())
const shareParticleRefs = Array.from({ length: 6 }, () => ref())
const rippleRing1Ref = ref()
const rippleRing2Ref = ref()
const rippleRing3Ref = ref()
const qrCodeRef = ref()

// Particle systems for communication signals
const signalParticles = shallowRef<Points | null>(null)
const networkParticles = shallowRef<Points | null>(null)

let animationId: number
let startTime = 0

// Contact theme colors
const contactColors = {
  primary: '#00FF41',      // Terminal green (matches contact section)
  secondary: '#A855F7',    // Purple
  accent: '#3B82F6',       // Blue
  signal: '#00FFFF',       // Cyan
  message: '#FFD700'       // Gold
}
void contactColors // Used in template

const createParticleSystems = () => {
  // Dispose existing particles
  if (signalParticles.value) {
    signalParticles.value.geometry.dispose()
    ;(signalParticles.value.material as PointsMaterial).dispose()
    signalParticles.value = null
  }
  if (networkParticles.value) {
    networkParticles.value.geometry.dispose()
    ;(networkParticles.value.material as PointsMaterial).dispose()
    networkParticles.value = null
  }

  if (props.quality === 'minimal') return

  const isHigh = props.quality === 'high'
  const signalCount = isHigh ? 80 : 25
  const networkCount = isHigh ? 60 : 20

  // Contact sharing particles - representing contact info being shared
  const signalPositions = new Float32Array(signalCount * 3)
  for (let i = 0; i < signalCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 0.8 + Math.random() * 1.2
    const height = (Math.random() - 0.5) * 0.8
    signalPositions[i * 3] = Math.cos(angle) * radius
    signalPositions[i * 3 + 1] = height
    signalPositions[i * 3 + 2] = Math.sin(angle) * radius
  }

  const signalGeometry = new BufferGeometry()
  signalGeometry.setAttribute('position', new BufferAttribute(signalPositions, 3))
  const signalMaterial = new PointsMaterial({
    color: 0x00FFFF,
    size: isHigh ? 0.02 : 0.03,
    opacity: 0.5,
    transparent: true,
    blending: AdditiveBlending
  })
  signalParticles.value = new Points(signalGeometry, signalMaterial)

  // Network particles - subtle background
  const networkPositions = new Float32Array(networkCount * 3)
  for (let i = 0; i < networkCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 1.2 + Math.random() * 0.8
    const height = (Math.random() - 0.5) * 0.6
    networkPositions[i * 3] = Math.cos(angle) * radius
    networkPositions[i * 3 + 1] = height
    networkPositions[i * 3 + 2] = Math.sin(angle) * radius
  }

  const networkGeometry = new BufferGeometry()
  networkGeometry.setAttribute('position', new BufferAttribute(networkPositions, 3))
  const networkMaterial = new PointsMaterial({
    color: 0x00FF41,
    size: isHigh ? 0.015 : 0.025,
    opacity: 0.3,
    transparent: true,
    blending: AdditiveBlending
  })
  networkParticles.value = new Points(networkGeometry, networkMaterial)
}

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  
  // Very gentle scene rotation (slowed down)
  if (sceneRef.value) {
    sceneRef.value.rotation.y = elapsed * 0.015
  }
  
  // Central hub pulsing (contact center) - slower and smaller
  if (hubRef.value) {
    const pulse = 1 + Math.sin(elapsed * 0.4) * 0.05
    hubRef.value.scale.set(pulse, pulse, pulse)
    hubRef.value.rotation.y = elapsed * 0.06
  }
  
  // Inner hub counter-rotation - slower
  if (innerHubRef.value) {
    innerHubRef.value.rotation.y = -elapsed * 0.1
    innerHubRef.value.rotation.x = Math.sin(elapsed * 0.15) * 0.05
  }
  
  // Contact cards floating around center (representing business cards being shared)
  contactCardRefs.forEach((cardRef, i) => {
    if (cardRef.value) {
      const angle = elapsed * 0.08 + (i * Math.PI * 2) / 4
      const radius = 1.0 + Math.sin(elapsed * 0.2 + i) * 0.1
      const height = Math.sin(elapsed * 0.25 + i * 0.6) * 0.3
      cardRef.value.position.x = Math.cos(angle) * radius
      cardRef.value.position.z = Math.sin(angle) * radius
      cardRef.value.position.y = height
      cardRef.value.rotation.y = elapsed * 0.15 + i
      cardRef.value.rotation.z = Math.sin(elapsed * 0.2 + i) * 0.1
      // Gentle floating
      const float = 1 + Math.sin(elapsed * 0.3 + i) * 0.05
      cardRef.value.scale.set(float, float, float)
    }
  })
  
  // Share particles (contact info being shared) - slower movement
  shareParticleRefs.forEach((particleRef, i) => {
    if (particleRef.value) {
      const cardIndex = i % 4
      const phase = (elapsed * 0.25 + (i * 0.1)) % 1
      const baseAngle = (cardIndex * Math.PI * 2) / 4
      const angle = baseAngle + elapsed * 0.08
      const startRadius = 1.0
      const endRadius = 0.15
      const radius = startRadius - (startRadius - endRadius) * phase
      const baseHeight = Math.sin(elapsed * 0.25 + cardIndex * 0.6) * 0.3
      const height = baseHeight * (1 - phase * 0.5)
      
      particleRef.value.position.x = Math.cos(angle) * radius
      particleRef.value.position.z = Math.sin(angle) * radius
      particleRef.value.position.y = height
      
      // Scale based on distance
      const scale = 0.15 + phase * 0.3
      particleRef.value.scale.set(scale, scale, scale)
      
      // Slow rotation
      particleRef.value.rotation.y = elapsed * 0.5 + i
      particleRef.value.rotation.x = elapsed * 0.4 + i * 0.3
    }
  })
  
  // Contact sharing ripples - slower and smaller
  const animateRipple = (ringRef: any, phase: number, speed: number) => {
    if (ringRef.value) {
      const cycle = ((elapsed * speed + phase) % 1)
      const scale = 1 + cycle * 2
      const opacity = (1 - cycle) * 0.25
      ringRef.value.scale.set(scale, scale, 1)
      if (ringRef.value.material) {
        ringRef.value.material.opacity = Math.max(0, opacity)
      }
    }
  }
  
  animateRipple(rippleRing1Ref, 0, 0.15)
  animateRipple(rippleRing2Ref, 0.33, 0.15)
  animateRipple(rippleRing3Ref, 0.66, 0.15)
  
  // QR code rotation - very slow
  if (qrCodeRef.value) {
    qrCodeRef.value.rotation.y = elapsed * 0.05
    qrCodeRef.value.position.y = Math.sin(elapsed * 0.2) * 0.05
  }
  
  // Animate particle systems - slower
  if (signalParticles.value) {
    signalParticles.value.rotation.y = elapsed * 0.03
    signalParticles.value.rotation.x = Math.sin(elapsed * 0.05) * 0.02
  }
  if (networkParticles.value) {
    networkParticles.value.rotation.y = -elapsed * 0.025
  }
  
  animationId = requestAnimationFrame(animate)
}

watch(() => props.quality, createParticleSystems, { immediate: true })

onMounted(() => {
  startTime = Date.now()
  createParticleSystems()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  if (signalParticles.value) {
    signalParticles.value.geometry.dispose()
    ;(signalParticles.value.material as PointsMaterial).dispose()
  }
  if (networkParticles.value) {
    networkParticles.value.geometry.dispose()
    ;(networkParticles.value.material as PointsMaterial).dispose()
  }
})

const segmentCount = computed(() => props.quality === 'high' ? 64 : 32)
const ringSegments = computed(() => props.quality === 'high' ? 128 : 64)
const isMinimal = computed(() => props.quality === 'minimal')
void ringSegments // Used in template
void isMinimal // Used in template
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0.5, 4]" :look-at="[0, 0, 0]" />
  
  <!-- Contact sharing lighting - softer and more focused -->
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 0, 1.5]" :intensity="1.2" :color="contactColors.primary" />
  <TresPointLight :position="[1, 1, 1.5]" :intensity="0.5" :color="contactColors.signal" />
  <TresPointLight :position="[-1, 0.8, 1.5]" :intensity="0.4" :color="contactColors.secondary" />
  
  <TresGroup ref="sceneRef">
    <!-- Central Contact Hub (smaller, more intimate) -->
    <TresGroup ref="hubRef">
      <!-- Inner core -->
      <TresGroup ref="innerHubRef">
        <TresMesh>
          <TresIcosahedronGeometry :args="[0.15, 1]" />
          <TresMeshStandardMaterial 
            :color="'#FFFFFF'"
            :emissive="contactColors.primary"
            :emissive-intensity="1.2"
            :metalness="0.95"
            :roughness="0.05"
          />
        </TresMesh>
      </TresGroup>
      
      <!-- Main hub sphere (smaller) -->
      <TresMesh>
        <TresSphereGeometry :args="[0.3, segmentCount, segmentCount]" />
        <TresMeshStandardMaterial 
          :color="contactColors.primary"
          :emissive="contactColors.primary"
          :emissive-intensity="1"
          :metalness="0.9"
          :roughness="0.1"
        />
      </TresMesh>
      
      <!-- Outer glow layers (smaller) -->
      <TresMesh>
        <TresSphereGeometry :args="[0.4, 32, 32]" />
        <TresMeshBasicMaterial :color="contactColors.primary" :opacity="0.2" :transparent="true" />
      </TresMesh>
      <TresMesh>
        <TresSphereGeometry :args="[0.5, 32, 32]" />
        <TresMeshBasicMaterial :color="contactColors.signal" :opacity="0.12" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- QR Code representation (contact sharing) -->
    <TresGroup ref="qrCodeRef" :position="[0, 0, 0.35]">
      <!-- QR code base -->
      <TresMesh>
        <TresBoxGeometry :args="[0.25, 0.25, 0.02]" />
        <TresMeshStandardMaterial 
          color="#FFFFFF"
          :roughness="0.3"
          :metalness="0.1"
        />
      </TresMesh>
      <!-- QR code pattern (simplified) -->
      <TresMesh v-if="!isMinimal" :position="[-0.08, 0.08, 0.015]">
        <TresBoxGeometry :args="[0.05, 0.05, 0.01]" />
        <TresMeshStandardMaterial color="#000000" />
      </TresMesh>
      <TresMesh v-if="!isMinimal" :position="[0.08, -0.08, 0.015]">
        <TresBoxGeometry :args="[0.05, 0.05, 0.01]" />
        <TresMeshStandardMaterial color="#000000" />
      </TresMesh>
      <!-- Glow effect -->
      <TresMesh>
        <TresBoxGeometry :args="[0.3, 0.3, 0.01]" />
        <TresMeshBasicMaterial :color="contactColors.primary" :opacity="0.15" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Contact sharing ripples (smaller, slower) -->
    <TresMesh ref="rippleRing1Ref" :rotation="[Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[0.6, 0.7, ringSegments]" />
      <TresMeshBasicMaterial 
        :color="contactColors.primary" 
        :opacity="0.2" 
        :transparent="true" 
        :side="2" 
      />
    </TresMesh>
    <TresMesh ref="rippleRing2Ref" :rotation="[Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[0.6, 0.7, ringSegments]" />
      <TresMeshBasicMaterial 
        :color="contactColors.signal" 
        :opacity="0.15" 
        :transparent="true" 
        :side="2" 
      />
    </TresMesh>
    <TresMesh ref="rippleRing3Ref" :rotation="[Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[0.6, 0.7, ringSegments]" />
      <TresMeshBasicMaterial 
        :color="contactColors.secondary" 
        :opacity="0.12" 
        :transparent="true" 
        :side="2" 
      />
    </TresMesh>
    
    <!-- Contact Cards (business cards being shared) -->
    <TresGroup 
      v-for="(_, i) in 4" 
      :key="`card-${i}`"
      :ref="el => contactCardRefs[i].value = el"
    >
      <!-- Card body -->
      <TresMesh>
        <TresBoxGeometry :args="[0.35, 0.22, 0.02]" />
        <TresMeshStandardMaterial 
          color="#F8F4E8"
          :roughness="0.8"
          :metalness="0.1"
        />
      </TresMesh>
      <!-- Card glow -->
      <TresMesh v-if="!isMinimal">
        <TresBoxGeometry :args="[0.4, 0.27, 0.01]" />
        <TresMeshBasicMaterial 
          :color="i % 2 === 0 ? contactColors.primary : contactColors.accent" 
          :opacity="0.15" 
          :transparent="true" 
        />
      </TresMesh>
      <!-- Contact icon on card -->
      <TresMesh v-if="!isMinimal" :position="[0, 0, 0.015]">
        <TresSphereGeometry :args="[0.04, 8, 8]" />
        <TresMeshStandardMaterial 
          :color="contactColors.primary"
          :emissive="contactColors.primary"
          :emissive-intensity="0.6"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Share Particles (contact info being shared) -->
    <TresMesh 
      v-for="(_, i) in 6" 
      :key="`share-${i}`"
      :ref="el => shareParticleRefs[i].value = el"
    >
      <TresOctahedronGeometry :args="[0.05]" />
      <TresMeshStandardMaterial 
        :color="contactColors.message"
        :emissive="contactColors.message"
        :emissive-intensity="0.8"
        :metalness="0.9"
        :roughness="0.1"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Particle systems -->
  <primitive v-if="signalParticles" :object="signalParticles" />
  <primitive v-if="networkParticles" :object="networkParticles" />
  
  <!-- Subtle floor -->
  <TresMesh :position="[0, -2.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[15, 15]" />
    <TresMeshStandardMaterial 
      color="#0A0A12" 
      :roughness="0.85"
      :metalness="0.15"
    />
  </TresMesh>
</template>
