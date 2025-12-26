<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial, AdditiveBlending } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

const props = defineProps<{
  quality: QualityLevel
}>()

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller - will be initialized after element is found
const animationController = useAnimationController(sectionElement)

// Theme colors for the hero scene
const themeColors = {
  primary: '#7C3AED',      // Main purple
  secondary: '#A855F7',    // Lighter purple
  accent: '#EC4899',       // Pink
  energy: '#00FFFF',       // Cyan
  gold: '#FFD700',         // Gold highlights
  indigo: '#6366F1'        // Indigo
}

// Passion spheres with enhanced properties
const passionSpheres = [
  { color: '#A855F7', label: 'Architecture' },
  { color: '#6366F1', label: 'Modernization' },
  { color: '#FBBF24', label: 'Performance' },
  { color: '#8B5CF6', label: 'Frontend' },
  { color: '#F97316', label: 'Team' },
  { color: '#EC4899', label: 'Making' },
  { color: '#3B82F6', label: 'Gaming' }
]

// Refs for animated objects
const centerCoreRef = ref()
const innerCoreRef = ref()
const energyFieldRef = ref()
const pulseRing1Ref = ref()
const pulseRing2Ref = ref()
const pulseRing3Ref = ref()
const nebulaRef = ref()
const orbitGroupRef = ref()
const passionRefs = passionSpheres.map(() => ref())

// Animation state
let startTime = 0

// Orbital configuration
const baseOrbitRadius = 3.2
const orbitEccentricity = [1.0, 1.15, 0.95, 1.1, 0.9, 1.05, 1.2]
const orbitTilts = [0, 0.2, -0.15, 0.1, -0.25, 0.18, -0.12]
const orbitSpeeds = [0.08, 0.1, 0.07, 0.12, 0.09, 0.075, 0.11]

// Calculate orbital position for each passion sphere
const getOrbitPosition = (index: number, elapsed: number) => {
  const angleOffset = (index / passionSpheres.length) * Math.PI * 2
  const speed = orbitSpeeds[index]
  const angle = angleOffset + elapsed * speed

  // Elliptical orbit
  const radiusX = baseOrbitRadius * orbitEccentricity[index]
  const radiusZ = baseOrbitRadius / orbitEccentricity[index]

  // Orbital tilt
  const tilt = orbitTilts[index]

  // Vertical oscillation
  const verticalPhase = elapsed * 0.3 + index * 0.9
  const verticalAmplitude = 0.4 + Math.sin(index * 1.5) * 0.15
  const verticalOffset = Math.sin(verticalPhase) * verticalAmplitude

  // Breathing effect
  const breathe = 1 + Math.sin(elapsed * 0.25 + index * 0.7) * 0.06

  return {
    x: Math.cos(angle) * radiusX * breathe,
    y: verticalOffset + Math.sin(angle) * tilt * 1.5,
    z: Math.sin(angle) * radiusZ * breathe
  }
}

// Particle systems
const cosmicDust = shallowRef<Points | null>(null)
const energyParticles = shallowRef<Points | null>(null)
const starField = shallowRef<Points | null>(null)

const createParticleSystems = () => {
  // Dispose existing particles
  const disposeParticles = (particles: Points | null) => {
    if (particles) {
      particles.geometry.dispose()
        ; (particles.material as PointsMaterial).dispose()
    }
  }

  disposeParticles(cosmicDust.value)
  disposeParticles(energyParticles.value)
  disposeParticles(starField.value)
  cosmicDust.value = null
  energyParticles.value = null
  starField.value = null

  // Skip particles entirely for minimal quality
  if (props.quality === 'minimal') return

  const isHigh = props.quality === 'high'

  // Star field - distant background stars
  const starCount = isHigh ? 800 : 150
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 15 + Math.random() * 25
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    starPositions[i * 3 + 2] = r * Math.cos(phi)
  }

  const starGeometry = new BufferGeometry()
  starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  const starMaterial = new PointsMaterial({
    color: 0xFFFFFF,
    size: isHigh ? 0.03 : 0.05,
    opacity: 0.6,
    transparent: true
  })
  starField.value = new Points(starGeometry, starMaterial)

  // Cosmic dust - closer atmospheric particles
  const dustCount = isHigh ? 500 : 80
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 2 + Math.random() * 10
    dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8
    dustPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }

  const dustGeometry = new BufferGeometry()
  dustGeometry.setAttribute('position', new BufferAttribute(dustPositions, 3))
  const dustMaterial = new PointsMaterial({
    color: 0xA855F7,
    size: isHigh ? 0.04 : 0.06,
    opacity: 0.35,
    transparent: true,
    blending: AdditiveBlending
  })
  cosmicDust.value = new Points(dustGeometry, dustMaterial)

  // Energy particles - concentrated near orbit path
  const energyCount = isHigh ? 250 : 40
  const energyPositions = new Float32Array(energyCount * 3)
  for (let i = 0; i < energyCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radiusOffset = (Math.random() - 0.5) * 1.2
    const r = baseOrbitRadius + radiusOffset
    energyPositions[i * 3] = Math.cos(angle) * r
    energyPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2
    energyPositions[i * 3 + 2] = Math.sin(angle) * r
  }

  const energyGeometry = new BufferGeometry()
  energyGeometry.setAttribute('position', new BufferAttribute(energyPositions, 3))
  const energyMaterial = new PointsMaterial({
    color: 0x00FFFF,
    size: isHigh ? 0.05 : 0.07,
    opacity: 0.5,
    transparent: true,
    blending: AdditiveBlending
  })
  energyParticles.value = new Points(energyGeometry, energyMaterial)
}

// Main animation loop
const updateAnimations = (elapsed: number, delta: number) => {
  // Animate passion spheres in orbit
  passionRefs.forEach((objRef, index) => {
    if (objRef.value) {
      const pos = getOrbitPosition(index, elapsed)

      // Smooth interpolation
      objRef.value.position.x += (pos.x - objRef.value.position.x) * 0.08
      objRef.value.position.y += (pos.y - objRef.value.position.y) * 0.08
      objRef.value.position.z += (pos.z - objRef.value.position.z) * 0.08

      // Self rotation
      const rotSpeed = 0.4 + index * 0.1
      objRef.value.rotation.y = elapsed * rotSpeed
      objRef.value.rotation.x = Math.sin(elapsed * 0.4 + index) * 0.25

      // Pulsing scale
      const pulsePhase = elapsed * 1.2 + index * 0.6
      const scale = 1 + Math.sin(pulsePhase) * 0.1
      objRef.value.scale.set(scale, scale, scale)
    }
  })

  // Central core animation
  if (centerCoreRef.value) {
    centerCoreRef.value.rotation.y = elapsed * 0.12
    centerCoreRef.value.rotation.x = Math.sin(elapsed * 0.15) * 0.08
    const corePulse = 1 + Math.sin(elapsed * 1.2) * 0.1
    centerCoreRef.value.scale.set(corePulse, corePulse, corePulse)
  }

  // Inner core counter-rotation
  if (innerCoreRef.value) {
    innerCoreRef.value.rotation.y = -elapsed * 0.25
    innerCoreRef.value.rotation.z = elapsed * 0.18
  }

  // Energy field breathing
  if (energyFieldRef.value) {
    energyFieldRef.value.rotation.y = elapsed * 0.04
    energyFieldRef.value.rotation.x = elapsed * 0.025
    const fieldPulse = 1 + Math.sin(elapsed * 0.6) * 0.12
    energyFieldRef.value.scale.set(fieldPulse, fieldPulse, fieldPulse)
  }

  // Expanding pulse rings
  const animatePulseRing = (ringRef: any, phase: number, maxScale: number) => {
    if (ringRef.value) {
      const cycle = ((elapsed * 0.25 + phase) % 1)
      const scale = 1 + cycle * maxScale
      const opacity = (1 - cycle) * 0.35
      ringRef.value.scale.set(scale, scale, 1)
      if (ringRef.value.material) {
        ringRef.value.material.opacity = Math.max(0, opacity)
      }
    }
  }

  animatePulseRing(pulseRing1Ref, 0, 2.5)
  animatePulseRing(pulseRing2Ref, 0.33, 2.5)
  animatePulseRing(pulseRing3Ref, 0.66, 2.5)

  // Nebula slow rotation
  if (nebulaRef.value) {
    nebulaRef.value.rotation.y = elapsed * 0.015
    nebulaRef.value.rotation.z = elapsed * 0.008
  }

  // Orbit group subtle rotation
  if (orbitGroupRef.value) {
    orbitGroupRef.value.rotation.y = elapsed * 0.02
  }

  // Particle systems animation
  if (cosmicDust.value) {
    cosmicDust.value.rotation.y = elapsed * 0.015
    cosmicDust.value.rotation.x = Math.sin(elapsed * 0.05) * 0.05
  }
  if (energyParticles.value) {
    energyParticles.value.rotation.y = -elapsed * 0.06
    energyParticles.value.rotation.x = Math.sin(elapsed * 0.08) * 0.08
  }
  if (starField.value) {
    starField.value.rotation.y = elapsed * 0.003
  }
}

// Watch quality changes
watch(() => props.quality, createParticleSystems, { immediate: true })

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
  if (props.quality === 'high') return 48
  if (props.quality === 'low') return 16
  return 8 // minimal
})
const isMinimal = computed(() => props.quality === 'minimal')

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="hero"]')
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

onBeforeUnmount(() => {
  animationController.stop()
  const disposeParticles = (particles: Points | null) => {
    if (particles) {
      particles.geometry.dispose()
        ; (particles.material as PointsMaterial).dispose()
    }
  }
  disposeParticles(cosmicDust.value)
  disposeParticles(energyParticles.value)
  disposeParticles(starField.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 1, 10]" :look-at="[0, 0, 0]" />

  <!-- Cinematic lighting setup -->
  <TresAmbientLight :intensity="0.2" />
  <!-- Central core light -->
  <TresPointLight :position="[0, 0, 0]" :intensity="2.5" :color="themeColors.primary" :distance="12" />
  <!-- Rim lights for depth -->
  <TresPointLight :position="[6, 3, -3]" :intensity="1" :color="themeColors.gold" :distance="18" />
  <TresPointLight :position="[-6, -2, -3]" :intensity="0.8" :color="themeColors.energy" :distance="16" />
  <TresPointLight :position="[0, -5, 4]" :intensity="0.6" :color="themeColors.secondary" :distance="12" />
  <TresPointLight :position="[-4, 4, 4]" :intensity="0.5" :color="themeColors.accent" :distance="10" />
  <!-- Fill light -->
  <TresDirectionalLight :position="[0, 8, 8]" :intensity="0.35" :color="'#FFFFFF'" />

  <!-- Background nebula effect -->
  <TresGroup ref="nebulaRef">
    <TresMesh :position="[0, 0, -15]">
      <TresPlaneGeometry :args="[50, 50]" />
      <TresMeshBasicMaterial :color="themeColors.indigo" :opacity="0.025" :transparent="true" />
    </TresMesh>
    <TresMesh :position="[6, 4, -12]" :rotation="[0, 0, 0.4]">
      <TresCircleGeometry :args="[10, 32]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.035" :transparent="true" />
    </TresMesh>
    <TresMesh :position="[-7, -3, -13]" :rotation="[0, 0, -0.3]">
      <TresCircleGeometry :args="[8, 32]" />
      <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.025" :transparent="true" />
    </TresMesh>
    <TresMesh :position="[3, -5, -11]" :rotation="[0, 0, 0.6]">
      <TresCircleGeometry :args="[6, 32]" />
      <TresMeshBasicMaterial :color="themeColors.energy" :opacity="0.02" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Central Core - Multi-layered energy source -->
  <TresGroup ref="centerCoreRef">
    <!-- Inner plasma core -->
    <TresGroup ref="innerCoreRef">
      <TresMesh>
        <TresIcosahedronGeometry :args="[0.5, 2]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="themeColors.energy" :emissive-intensity="1.8"
          :metalness="1" :roughness="0" />
      </TresMesh>
    </TresGroup>

    <!-- Main core sphere -->
    <TresMesh>
      <TresSphereGeometry :args="[0.85, segmentCount, segmentCount]" />
      <TresMeshStandardMaterial :color="themeColors.primary" :emissive="themeColors.primary" :emissive-intensity="0.8"
        :metalness="0.95" :roughness="0.05" />
    </TresMesh>

    <!-- First glow layer -->
    <TresMesh>
      <TresSphereGeometry :args="[1.1, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.18" :transparent="true" />
    </TresMesh>

    <!-- Second glow layer -->
    <TresMesh>
      <TresSphereGeometry :args="[1.35, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :opacity="0.08" :transparent="true" />
    </TresMesh>

    <!-- Outer atmosphere -->
    <TresMesh>
      <TresSphereGeometry :args="[1.6, segmentCount, segmentCount]" />
      <TresMeshBasicMaterial :color="themeColors.energy" :opacity="0.04" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Energy field wireframe -->
  <TresGroup ref="energyFieldRef">
    <TresMesh>
      <TresIcosahedronGeometry :args="[1.9, 1]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :wireframe="true" :opacity="0.18" :transparent="true" />
    </TresMesh>
    <TresMesh :rotation="[Math.PI / 4, Math.PI / 4, 0]">
      <TresIcosahedronGeometry :args="[2.2, 1]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :wireframe="true" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Expanding pulse rings -->
  <TresMesh ref="pulseRing1Ref" :rotation="[Math.PI / 2, 0, 0]">
    <TresRingGeometry :args="[1.5, 1.7, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.25" :transparent="true" :side="2" />
  </TresMesh>
  <TresMesh ref="pulseRing2Ref" :rotation="[Math.PI / 2, 0, 0]">
    <TresRingGeometry :args="[1.5, 1.7, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.energy" :opacity="0.2" :transparent="true" :side="2" />
  </TresMesh>
  <TresMesh ref="pulseRing3Ref" :rotation="[Math.PI / 2, 0, 0]">
    <TresRingGeometry :args="[1.5, 1.7, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.15" :transparent="true" :side="2" />
  </TresMesh>

  <!-- Orbital track visualization -->
  <TresGroup ref="orbitGroupRef" :rotation="[Math.PI / 2, 0, 0]">
    <!-- Primary orbit ring -->
    <TresMesh>
      <TresTorusGeometry :args="[baseOrbitRadius, 0.012, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.2" :transparent="true" />
    </TresMesh>
    <!-- Secondary orbital guides -->
    <TresMesh :rotation="[0.2, 0, 0]">
      <TresTorusGeometry :args="[baseOrbitRadius * 1.08, 0.006, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :opacity="0.1" :transparent="true" />
    </TresMesh>
    <TresMesh :rotation="[-0.15, 0, 0]">
      <TresTorusGeometry :args="[baseOrbitRadius * 0.92, 0.006, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.08" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Orbiting passion spheres -->
  <TresGroup v-for="(passion, index) in passionSpheres" :key="index" :ref="el => passionRefs[index].value = el">
    <!-- Main sphere -->
    <TresMesh>
      <TresSphereGeometry :args="[0.28, sphereSegments, sphereSegments]" />
      <TresMeshStandardMaterial :color="passion.color" :emissive="passion.color" :emissive-intensity="0.6"
        :roughness="0.25" :metalness="0.7" />
    </TresMesh>
    <!-- Inner glow - hide on minimal -->
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.38, 16, 16]" />
      <TresMeshBasicMaterial :color="passion.color" :opacity="0.15" :transparent="true" />
    </TresMesh>
    <!-- Outer aura - hide on minimal -->
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.5, 12, 12]" />
      <TresMeshBasicMaterial :color="passion.color" :opacity="0.06" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Decorative floating crystals - hide on minimal -->
  <template v-if="!isMinimal">
    <TresMesh :position="[4.5, 2.5, -2]" :rotation="[0.3, 0.5, 0.2]">
      <TresOctahedronGeometry :args="[0.15]" />
      <TresMeshStandardMaterial :color="themeColors.energy" :emissive="themeColors.energy" :emissive-intensity="0.8"
        :metalness="0.9" :roughness="0.1" />
    </TresMesh>
    <TresMesh :position="[-4, -2, -1]" :rotation="[0.5, 0.3, 0.4]">
      <TresOctahedronGeometry :args="[0.12]" />
      <TresMeshStandardMaterial :color="themeColors.gold" :emissive="themeColors.gold" :emissive-intensity="0.7"
        :metalness="0.9" :roughness="0.1" />
    </TresMesh>
    <TresMesh :position="[3, -3, 1]" :rotation="[0.2, 0.7, 0.1]">
      <TresOctahedronGeometry :args="[0.1]" />
      <TresMeshStandardMaterial :color="themeColors.accent" :emissive="themeColors.accent" :emissive-intensity="0.6"
        :metalness="0.9" :roughness="0.1" />
    </TresMesh>
    <TresMesh :position="[-3.5, 3, 0.5]" :rotation="[0.4, 0.2, 0.6]">
      <TresOctahedronGeometry :args="[0.08]" />
      <TresMeshStandardMaterial :color="themeColors.secondary" :emissive="themeColors.secondary" :emissive-intensity="0.5"
        :metalness="0.9" :roughness="0.1" />
    </TresMesh>
  </template>

  <!-- Particle systems -->
  <primitive v-if="starField" :object="starField" />
  <primitive v-if="cosmicDust" :object="cosmicDust" />
  <primitive v-if="energyParticles" :object="energyParticles" />
</template>
