<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, shallowRef, watch } from 'vue'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial, AdditiveBlending } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

const props = defineProps<{
  quality: QualityLevel
}>()

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller
const animationController = useAnimationController(sectionElement)

// Refs for each passion object
const knowledgeRef = ref()
const architectureRef = ref()
const modernizationRef = ref()
const performanceRef = ref()
const frontendRef = ref()
const teamBuildingRef = ref()
const makingRef = ref()
const centerCoreRef = ref()
const innerCoreRef = ref()
const energyFieldRef = ref()
const pulseRing1Ref = ref()
const pulseRing2Ref = ref()
const pulseRing3Ref = ref()
const nebulaRef = ref()

// Enhanced passion colors - more vibrant with complementary tones
const passionColors = {
  knowledge: '#FFD700',       // Rich gold
  architecture: '#A855F7',    // Vivid purple
  modernization: '#00D9FF',   // Cyan blue
  performance: '#FF6B2B',     // Electric orange
  frontend: '#00FF88',        // Neon green
  teamBuilding: '#FF3366',    // Hot pink
  making: '#FF9500'           // Amber
}

// Theme colors for energy effects
const themeColors = {
  primary: '#A855F7',
  secondary: '#6366F1',
  accent: '#EC4899',
  energy: '#00FFFF'
}

let startTime = 0

// Enhanced orbit configuration with elliptical paths
const baseOrbitRadius = 4.2
const orbitEccentricity = [1.0, 1.2, 0.9, 1.1, 1.0, 0.95, 1.15] // Different for each object
const orbitTilts = [0, 0.2, -0.15, 0.1, -0.2, 0.15, -0.1] // Orbital plane tilts
const orbitSpeeds = [0.12, 0.15, 0.1, 0.18, 0.13, 0.11, 0.16] // Individual speeds

const getOrbitPosition = (index: number, elapsed: number) => {
  const angleOffset = (index / 7) * Math.PI * 2
  const speed = orbitSpeeds[index]
  const angle = angleOffset + elapsed * speed

  // Elliptical orbit
  const radiusX = baseOrbitRadius * orbitEccentricity[index]
  const radiusZ = baseOrbitRadius / orbitEccentricity[index]

  // Orbital tilt
  const tilt = orbitTilts[index]

  // Smooth vertical oscillation with phase offset
  const verticalPhase = elapsed * 0.4 + index * 0.9
  const verticalAmplitude = 0.5 + Math.sin(index * 1.5) * 0.2
  const verticalOffset = Math.sin(verticalPhase) * verticalAmplitude

  // Breathing effect - objects move slightly in/out
  const breathe = 1 + Math.sin(elapsed * 0.3 + index * 0.7) * 0.08

  return {
    x: Math.cos(angle) * radiusX * breathe,
    y: verticalOffset + Math.sin(angle) * tilt * 2,
    z: Math.sin(angle) * radiusZ * breathe
  }
}

// Particle system for cosmic dust
const dustParticles = shallowRef<Points | null>(null)
const energyParticles = shallowRef<Points | null>(null)

const createParticleSystems = () => {
  // Dispose existing particles
  if (dustParticles.value) {
    dustParticles.value.geometry.dispose()
      ; (dustParticles.value.material as PointsMaterial).dispose()
    dustParticles.value = null
  }
  if (energyParticles.value) {
    energyParticles.value.geometry.dispose()
      ; (energyParticles.value.material as PointsMaterial).dispose()
    energyParticles.value = null
  }

  // Skip particles entirely for minimal quality
  if (props.quality === 'minimal') return

  const dustCount = props.quality === 'high' ? 600 : 100
  const energyCount = props.quality === 'high' ? 300 : 50

  // Cosmic dust - scattered throughout
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 3 + Math.random() * 12
    dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8
    dustPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }

  const dustGeometry = new BufferGeometry()
  dustGeometry.setAttribute('position', new BufferAttribute(dustPositions, 3))

  const dustMaterial = new PointsMaterial({
    color: 0xA855F7,
    size: props.quality === 'high' ? 0.04 : 0.06,
    opacity: 0.4,
    transparent: true,
    blending: AdditiveBlending
  })

  dustParticles.value = new Points(dustGeometry, dustMaterial)

  // Energy particles - concentrated near orbit path
  const energyPositions = new Float32Array(energyCount * 3)
  for (let i = 0; i < energyCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radiusOffset = (Math.random() - 0.5) * 1.5
    const r = baseOrbitRadius + radiusOffset
    energyPositions[i * 3] = Math.cos(angle) * r
    energyPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.5
    energyPositions[i * 3 + 2] = Math.sin(angle) * r
  }

  const energyGeometry = new BufferGeometry()
  energyGeometry.setAttribute('position', new BufferAttribute(energyPositions, 3))

  const energyMaterial = new PointsMaterial({
    color: 0x00FFFF,
    size: props.quality === 'high' ? 0.06 : 0.08,
    opacity: 0.6,
    transparent: true,
    blending: AdditiveBlending
  })

  energyParticles.value = new Points(energyGeometry, energyMaterial)
}

watch(() => props.quality, createParticleSystems, { immediate: true })

const updateAnimations = (elapsed: number, delta: number) => {
  // Animate each passion object with enhanced motion
  const refs = [
    knowledgeRef,
    architectureRef,
    modernizationRef,
    performanceRef,
    frontendRef,
    teamBuildingRef,
    makingRef
  ]

  refs.forEach((objRef, index) => {
    if (objRef.value) {
      const pos = getOrbitPosition(index, elapsed)

      // Smooth interpolation for position
      objRef.value.position.x += (pos.x - objRef.value.position.x) * 0.1
      objRef.value.position.y += (pos.y - objRef.value.position.y) * 0.1
      objRef.value.position.z += (pos.z - objRef.value.position.z) * 0.1

      // Dynamic rotation with varied axes
      const rotSpeed = 0.3 + index * 0.08
      objRef.value.rotation.y = elapsed * rotSpeed
      objRef.value.rotation.x = Math.sin(elapsed * 0.5 + index) * 0.3
      objRef.value.rotation.z = Math.cos(elapsed * 0.3 + index * 0.5) * 0.15

      // Pulsing scale effect
      const pulsePhase = elapsed * 1.5 + index * 0.5
      const scale = 1 + Math.sin(pulsePhase) * 0.08
      objRef.value.scale.set(scale, scale, scale)
    }
  })

  // Central core complex animation
  if (centerCoreRef.value) {
    centerCoreRef.value.rotation.y = elapsed * 0.15
    centerCoreRef.value.rotation.x = Math.sin(elapsed * 0.2) * 0.1
    const corePulse = 1 + Math.sin(elapsed * 1.5) * 0.12
    centerCoreRef.value.scale.set(corePulse, corePulse, corePulse)
  }

  // Inner core counter-rotation
  if (innerCoreRef.value) {
    innerCoreRef.value.rotation.y = -elapsed * 0.3
    innerCoreRef.value.rotation.z = elapsed * 0.2
  }

  // Energy field breathing
  if (energyFieldRef.value) {
    energyFieldRef.value.rotation.y = elapsed * 0.05
    energyFieldRef.value.rotation.x = elapsed * 0.03
    const fieldPulse = 1 + Math.sin(elapsed * 0.8) * 0.15
    energyFieldRef.value.scale.set(fieldPulse, fieldPulse, fieldPulse)
  }

  // Expanding pulse rings
  const animatePulseRing = (ringRef: any, phase: number, maxScale: number) => {
    if (ringRef.value) {
      const cycle = ((elapsed * 0.3 + phase) % 1)
      const scale = 1 + cycle * maxScale
      const opacity = (1 - cycle) * 0.4
      ringRef.value.scale.set(scale, scale, 1)
      if (ringRef.value.material) {
        ringRef.value.material.opacity = Math.max(0, opacity)
      }
    }
  }

  animatePulseRing(pulseRing1Ref, 0, 3)
  animatePulseRing(pulseRing2Ref, 0.33, 3)
  animatePulseRing(pulseRing3Ref, 0.66, 3)

  // Nebula slow rotation
  if (nebulaRef.value) {
    nebulaRef.value.rotation.y = elapsed * 0.02
    nebulaRef.value.rotation.z = elapsed * 0.01
  }

  // Animate particle systems
  if (dustParticles.value) {
    dustParticles.value.rotation.y = elapsed * 0.02
  }
  if (energyParticles.value) {
    energyParticles.value.rotation.y = -elapsed * 0.08
    energyParticles.value.rotation.x = Math.sin(elapsed * 0.1) * 0.1
  }
}

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="about"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }
  
  startTime = Date.now()
  createParticleSystems()
  
  // Start animation loop with controller
  animationController.start((elapsed, delta) => {
    const totalElapsed = (Date.now() - startTime) / 1000
    updateAnimations(totalElapsed, delta)
  })
})

onUnmounted(() => {
  animationController.stop()
  if (dustParticles.value) {
    dustParticles.value.geometry.dispose()
      ; (dustParticles.value.material as PointsMaterial).dispose()
  }
  if (energyParticles.value) {
    energyParticles.value.geometry.dispose()
      ; (energyParticles.value.material as PointsMaterial).dispose()
  }
})

// Computed quality values with minimal tier support
const segmentCount = computed(() => {
  if (props.quality === 'high') return 64
  if (props.quality === 'low') return 24
  return 12 // minimal
})
const ringSegments = computed(() => {
  if (props.quality === 'high') return 128
  if (props.quality === 'low') return 48
  return 24 // minimal
})
const sphereSegments = computed(() => {
  if (props.quality === 'high') return 32
  if (props.quality === 'low') return 16
  return 8 // minimal
})
const isMinimal = computed(() => props.quality === 'minimal')
</script>

<template>
  <TresPerspectiveCamera :position="[0, 4, 14]" :look-at="[0, 0, 0]" />

  <!-- Enhanced cinematic lighting -->
  <TresAmbientLight :intensity="0.25" />
  <!-- Central core light -->
  <TresPointLight :position="[0, 0, 0]" :intensity="3" :color="themeColors.primary" :distance="15" />
  <!-- Rim lights for depth -->
  <TresPointLight :position="[8, 4, -4]" :intensity="1.2" :color="passionColors.knowledge" :distance="20" />
  <TresPointLight :position="[-8, -3, -4]" :intensity="1" :color="passionColors.modernization" :distance="20" />
  <TresPointLight :position="[0, -6, 6]" :intensity="0.8" :color="passionColors.frontend" :distance="15" />
  <TresPointLight :position="[-5, 5, 5]" :intensity="0.6" :color="themeColors.accent" :distance="12" />
  <!-- Fill light -->
  <TresDirectionalLight :position="[0, 10, 10]" :intensity="0.4" :color="'#FFFFFF'" />

  <!-- Background nebula effect -->
  <TresGroup ref="nebulaRef">
    <TresMesh :position="[0, 0, -12]">
      <TresPlaneGeometry :args="[40, 40]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :opacity="0.03" :transparent="true" />
    </TresMesh>
    <TresMesh :position="[5, 3, -10]" :rotation="[0, 0, 0.5]">
      <TresCircleGeometry :args="[8, 32]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.04" :transparent="true" />
    </TresMesh>
    <TresMesh :position="[-6, -2, -11]" :rotation="[0, 0, -0.3]">
      <TresCircleGeometry :args="[6, 32]" />
      <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.03" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Central Core - Multi-layered energy source -->
  <TresGroup ref="centerCoreRef">
    <!-- Inner plasma core -->
    <TresGroup ref="innerCoreRef">
      <TresMesh>
        <TresIcosahedronGeometry :args="[0.6, 2]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="themeColors.energy" :emissive-intensity="1.5"
          :metalness="1" :roughness="0" />
      </TresMesh>
    </TresGroup>

    <!-- Main core sphere -->
    <TresMesh>
      <TresSphereGeometry :args="[1, segmentCount, segmentCount]" />
      <TresMeshStandardMaterial :color="themeColors.primary" :emissive="themeColors.primary" :emissive-intensity="0.9"
        :metalness="0.95" :roughness="0.05" />
    </TresMesh>

    <!-- First glow layer -->
    <TresMesh>
      <TresSphereGeometry :args="[1.25, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.2" :transparent="true" />
    </TresMesh>

    <!-- Second glow layer -->
    <TresMesh>
      <TresSphereGeometry :args="[1.5, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :opacity="0.1" :transparent="true" />
    </TresMesh>

    <!-- Outer atmosphere -->
    <TresMesh>
      <TresSphereGeometry :args="[1.8, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="themeColors.energy" :opacity="0.05" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Energy field wireframe -->
  <TresGroup ref="energyFieldRef">
    <TresMesh>
      <TresIcosahedronGeometry :args="[2.2, 1]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :wireframe="true" :opacity="0.2" :transparent="true" />
    </TresMesh>
    <TresMesh :rotation="[Math.PI / 4, Math.PI / 4, 0]">
      <TresIcosahedronGeometry :args="[2.5, 1]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :wireframe="true" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Expanding pulse rings -->
  <TresMesh ref="pulseRing1Ref" :rotation="[Math.PI / 2, 0, 0]">
    <TresRingGeometry :args="[1.8, 2, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.3" :transparent="true" :side="2" />
  </TresMesh>
  <TresMesh ref="pulseRing2Ref" :rotation="[Math.PI / 2, 0, 0]">
    <TresRingGeometry :args="[1.8, 2, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.energy" :opacity="0.25" :transparent="true" :side="2" />
  </TresMesh>
  <TresMesh ref="pulseRing3Ref" :rotation="[Math.PI / 2, 0, 0]">
    <TresRingGeometry :args="[1.8, 2, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.2" :transparent="true" :side="2" />
  </TresMesh>

  <!-- Orbital track visualization -->
  <TresGroup :rotation="[Math.PI / 2, 0, 0]">
    <!-- Primary orbit ring -->
    <TresMesh>
      <TresTorusGeometry :args="[baseOrbitRadius, 0.015, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.25" :transparent="true" />
    </TresMesh>
    <!-- Secondary orbital guides -->
    <TresMesh :rotation="[0.2, 0, 0]">
      <TresTorusGeometry :args="[baseOrbitRadius * 1.1, 0.008, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :opacity="0.12" :transparent="true" />
    </TresMesh>
    <TresMesh :rotation="[-0.15, 0, 0]">
      <TresTorusGeometry :args="[baseOrbitRadius * 0.9, 0.008, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 1. Knowledge Sharing - Luminous Book Stack (📚) -->
  <TresGroup ref="knowledgeRef">
    <!-- Book stack with glowing pages -->
    <TresMesh>
      <TresBoxGeometry :args="[0.9, 1.1, 0.18]" />
      <TresMeshStandardMaterial :color="passionColors.knowledge" :emissive="passionColors.knowledge"
        :emissive-intensity="0.7" :metalness="0.4" :roughness="0.3" />
    </TresMesh>
    <TresMesh v-if="!isMinimal" :position="[0, 0, 0.22]">
      <TresBoxGeometry :args="[0.85, 1.05, 0.15]" />
      <TresMeshStandardMaterial :color="'#FFA500'" :emissive="passionColors.knowledge" :emissive-intensity="0.5"
        :metalness="0.3" :roughness="0.4" />
    </TresMesh>
    <TresMesh v-if="!isMinimal" :position="[0, 0, 0.4]">
      <TresBoxGeometry :args="[0.8, 1.0, 0.12]" />
      <TresMeshStandardMaterial :color="passionColors.knowledge" :emissive="passionColors.knowledge"
        :emissive-intensity="0.6" :metalness="0.4" :roughness="0.3" />
    </TresMesh>
    <!-- Knowledge aura - hide on minimal -->
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[1.1, sphereSegments, sphereSegments]" />
      <TresMeshBasicMaterial :color="passionColors.knowledge" :opacity="0.15" :transparent="true" />
    </TresMesh>
    <!-- Floating sparkles - hide on minimal -->
    <template v-if="!isMinimal">
      <TresMesh :position="[0.5, 0.6, 0.3]">
        <TresOctahedronGeometry :args="[0.08]" />
        <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.9" :transparent="true" />
      </TresMesh>
      <TresMesh :position="[-0.4, -0.5, 0.2]">
        <TresOctahedronGeometry :args="[0.06]" />
        <TresMeshBasicMaterial :color="passionColors.knowledge" :opacity="0.8" :transparent="true" />
      </TresMesh>
    </template>
  </TresGroup>

  <!-- 2. Architecture - Crystal Temple (🏗️) -->
  <TresGroup ref="architectureRef">
    <!-- Central spire -->
    <TresMesh>
      <TresBoxGeometry :args="[0.35, 1.4, 0.35]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.6" :metalness="0.8" :roughness="0.2" />
    </TresMesh>
    <!-- Left pillar -->
    <TresMesh :position="[-0.55, -0.1, 0]">
      <TresBoxGeometry :args="[0.22, 1.15, 0.22]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.5" :metalness="0.7" :roughness="0.25" />
    </TresMesh>
    <!-- Right pillar -->
    <TresMesh :position="[0.55, -0.1, 0]">
      <TresBoxGeometry :args="[0.22, 1.15, 0.22]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.5" :metalness="0.7" :roughness="0.25" />
    </TresMesh>
    <!-- Crown/roof -->
    <TresMesh :position="[0, 0.85, 0]">
      <TresBoxGeometry :args="[1.4, 0.18, 0.6]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.7" :metalness="0.9" :roughness="0.1" />
    </TresMesh>
    <!-- Base platform -->
    <TresMesh :position="[0, -0.75, 0]">
      <TresBoxGeometry :args="[1.2, 0.1, 0.5]" />
      <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
        :emissive-intensity="0.4" :metalness="0.6" :roughness="0.3" />
    </TresMesh>
    <!-- Architecture glow -->
    <TresMesh>
      <TresSphereGeometry :args="[1.2, 24, 24]" />
      <TresMeshBasicMaterial :color="passionColors.architecture" :opacity="0.12" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- 3. Modernization - Energy Cycle (🔄) -->
  <TresGroup ref="modernizationRef">
    <!-- Main arc -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.65, 0.14, segmentCount, isMinimal ? 24 : 48, Math.PI * 1.6]" />
      <TresMeshStandardMaterial :color="passionColors.modernization" :emissive="passionColors.modernization"
        :emissive-intensity="0.8" :metalness="0.6" :roughness="0.2" />
    </TresMesh>
    <!-- Arrow head -->
    <TresMesh :position="[0.65, 0, 0]" :rotation="[0, 0, -Math.PI / 3]">
      <TresConeGeometry :args="[0.22, 0.4, 4]" />
      <TresMeshStandardMaterial :color="passionColors.modernization" :emissive="passionColors.modernization"
        :emissive-intensity="0.9" :metalness="0.7" :roughness="0.15" />
    </TresMesh>
    <!-- Inner energy core -->
    <TresMesh>
      <TresOctahedronGeometry :args="[0.35, 0]" />
      <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="passionColors.modernization" :emissive-intensity="1.2"
        :metalness="0.9" :roughness="0" />
    </TresMesh>
    <!-- Multi-layer glow - hide on minimal -->
    <template v-if="!isMinimal">
      <TresMesh>
        <TresSphereGeometry :args="[0.5, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.modernization" :opacity="0.25" :transparent="true" />
      </TresMesh>
      <TresMesh>
        <TresSphereGeometry :args="[1, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.modernization" :opacity="0.1" :transparent="true" />
      </TresMesh>
    </template>
  </TresGroup>

  <!-- 4. Performance - Electric Storm (⚡) -->
  <TresGroup ref="performanceRef">
    <!-- Main bolt -->
    <TresMesh :position="[0, 0.3, 0]" :rotation="[0, 0, Math.PI / 8]">
      <TresBoxGeometry :args="[0.28, 0.9, 0.12]" />
      <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
        :emissive-intensity="1" :metalness="0.9" :roughness="0.05" />
    </TresMesh>
    <!-- Middle segment -->
    <TresMesh :position="[0.18, -0.1, 0]" :rotation="[0, 0, -Math.PI / 5]">
      <TresBoxGeometry :args="[0.24, 0.7, 0.1]" />
      <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
        :emissive-intensity="1" :metalness="0.9" :roughness="0.05" />
    </TresMesh>
    <!-- Bottom point -->
    <TresMesh :position="[0.38, -0.55, 0]" :rotation="[0, 0, Math.PI / 6]">
      <TresConeGeometry :args="[0.12, 0.55, 4]" />
      <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="passionColors.performance" :emissive-intensity="1.2"
        :metalness="1" :roughness="0" />
    </TresMesh>
    <!-- Electric field - hide on minimal -->
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.9, sphereSegments, sphereSegments]" />
      <TresMeshBasicMaterial :color="passionColors.performance" :opacity="0.2" :transparent="true" />
    </TresMesh>
    <!-- Spark particles - hide on minimal -->
    <template v-if="!isMinimal">
      <TresMesh :position="[-0.3, 0.4, 0.2]">
        <TresOctahedronGeometry :args="[0.06]" />
        <TresMeshBasicMaterial :color="'#FFFFFF'" />
      </TresMesh>
      <TresMesh :position="[0.4, 0.2, -0.15]">
        <TresOctahedronGeometry :args="[0.05]" />
        <TresMeshBasicMaterial :color="passionColors.performance" />
      </TresMesh>
    </template>
  </TresGroup>

  <!-- 5. Frontend - Prism Palette (🎨) -->
  <TresGroup ref="frontendRef">
    <!-- Main prism shape -->
    <TresMesh :rotation="[Math.PI / 6, 0, Math.PI / 8]">
      <TresOctahedronGeometry :args="[0.55, 0]" />
      <TresMeshStandardMaterial :color="passionColors.frontend" :emissive="passionColors.frontend"
        :emissive-intensity="0.6" :metalness="0.5" :roughness="0.3" />
    </TresMesh>
    <!-- Floating color orbs - hide on minimal -->
    <template v-if="!isMinimal">
      <TresMesh :position="[0.45, 0.4, 0.25]">
        <TresSphereGeometry :args="[0.14, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="'#FF4757'" :emissive="'#FF4757'" :emissive-intensity="0.8" />
      </TresMesh>
      <TresMesh :position="[-0.45, 0.35, 0.2]">
        <TresSphereGeometry :args="[0.12, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="'#2ED573'" :emissive="'#2ED573'" :emissive-intensity="0.8" />
      </TresMesh>
      <TresMesh :position="[0, -0.45, 0.3]">
        <TresSphereGeometry :args="[0.13, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="'#3742FA'" :emissive="'#3742FA'" :emissive-intensity="0.8" />
      </TresMesh>
      <TresMesh :position="[0.3, -0.2, -0.35]">
        <TresSphereGeometry :args="[0.1, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="'#FFA502'" :emissive="'#FFA502'" :emissive-intensity="0.8" />
      </TresMesh>
      <!-- Rainbow glow -->
      <TresMesh>
        <TresSphereGeometry :args="[1, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.frontend" :opacity="0.12" :transparent="true" />
      </TresMesh>
    </template>
  </TresGroup>

  <!-- 6. Team Building - Connected Nodes (👥) -->
  <TresGroup ref="teamBuildingRef">
    <!-- Central figure -->
    <TresMesh :position="[0, 0.35, 0]">
      <TresSphereGeometry :args="[0.28, segmentCount, segmentCount]" />
      <TresMeshStandardMaterial :color="passionColors.teamBuilding" :emissive="passionColors.teamBuilding"
        :emissive-intensity="0.7" :metalness="0.4" :roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[0, -0.15, 0]">
      <TresCapsuleGeometry :args="[0.22, 0.45, 4, isMinimal ? 8 : 16]" />
      <TresMeshStandardMaterial :color="passionColors.teamBuilding" :emissive="passionColors.teamBuilding"
        :emissive-intensity="0.6" :metalness="0.4" :roughness="0.4" />
    </TresMesh>
    <!-- Left member - hide on minimal -->
    <template v-if="!isMinimal">
      <TresMesh :position="[-0.55, 0.25, -0.2]">
        <TresSphereGeometry :args="[0.2, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="'#FF8E72'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
      </TresMesh>
      <TresMesh :position="[-0.55, -0.1, -0.2]">
        <TresCapsuleGeometry :args="[0.16, 0.35, 4, 16]" />
        <TresMeshStandardMaterial :color="'#FF8E72'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
      </TresMesh>
      <!-- Right member -->
      <TresMesh :position="[0.55, 0.25, -0.2]">
        <TresSphereGeometry :args="[0.2, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="'#FFB8A0'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
      </TresMesh>
      <TresMesh :position="[0.55, -0.1, -0.2]">
        <TresCapsuleGeometry :args="[0.16, 0.35, 4, 16]" />
        <TresMeshStandardMaterial :color="'#FFB8A0'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
      </TresMesh>
      <!-- Connection lines (simplified as rings) -->
      <TresMesh :position="[-0.28, 0.1, -0.1]" :rotation="[0, Math.PI / 4, Math.PI / 2]">
        <TresTorusGeometry :args="[0.2, 0.015, 8, 16]" />
        <TresMeshBasicMaterial :color="passionColors.teamBuilding" :opacity="0.5" :transparent="true" />
      </TresMesh>
      <TresMesh :position="[0.28, 0.1, -0.1]" :rotation="[0, -Math.PI / 4, Math.PI / 2]">
        <TresTorusGeometry :args="[0.2, 0.015, 8, 16]" />
        <TresMeshBasicMaterial :color="passionColors.teamBuilding" :opacity="0.5" :transparent="true" />
      </TresMesh>
      <!-- Team aura -->
      <TresMesh>
        <TresSphereGeometry :args="[1.1, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.teamBuilding" :opacity="0.1" :transparent="true" />
      </TresMesh>
    </template>
  </TresGroup>

  <!-- 7. Making - Kinetic Gear (🔧) -->
  <TresGroup ref="makingRef">
    <!-- Primary gear -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.45, 0.18, 8, isMinimal ? 6 : 10]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.5"
        :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Outer teeth ring - hide on minimal -->
    <TresMesh v-if="!isMinimal" :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.62, 0.1, 6, 12]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.6"
        :metalness="0.95" :roughness="0.15" />
    </TresMesh>
    <!-- Center hub -->
    <TresMesh>
      <TresCylinderGeometry :args="[0.18, 0.18, 0.35, isMinimal ? 6 : 8]" />
      <TresMeshStandardMaterial :color="'#CD853F'" :emissive="passionColors.making" :emissive-intensity="0.4"
        :metalness="0.95" :roughness="0.1" />
    </TresMesh>
    <!-- Wrench extension -->
    <TresMesh :position="[0.75, 0, 0]">
      <TresBoxGeometry :args="[0.85, 0.14, 0.1]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.5"
        :metalness="0.8" :roughness="0.3" />
    </TresMesh>
    <!-- Tool head -->
    <TresMesh :position="[1.15, 0, 0]" :rotation="[0, 0, Math.PI / 4]">
      <TresBoxGeometry :args="[0.25, 0.25, 0.08]" />
      <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making" :emissive-intensity="0.6"
        :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Maker glow - hide on minimal -->
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[1, sphereSegments, sphereSegments]" />
      <TresMeshBasicMaterial :color="passionColors.making" :opacity="0.12" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Particle systems -->
  <primitive v-if="dustParticles" :object="dustParticles" />
  <primitive v-if="energyParticles" :object="energyParticles" />
</template>
