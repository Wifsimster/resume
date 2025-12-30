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

// Refs for motivation objects
const centerCoreRef = ref()
const innerCoreRef = ref()
const energyFieldRef = ref()
const pulseRing1Ref = ref()
const pulseRing2Ref = ref()
const pulseRing3Ref = ref()
const nebulaRef = ref()
const visionRef = ref()
const growthRef = ref()
const innovationRef = ref()

// Theme colors for motivation
const themeColors = {
  primary: '#A855F7',
  secondary: '#6366F1',
  accent: '#EC4899',
  energy: '#00FFFF',
  growth: '#FBBF24',
  vision: '#00FF88'
}

let startTime = 0

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

  // Energy particles - concentrated near center
  const energyPositions = new Float32Array(energyCount * 3)
  for (let i = 0; i < energyCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radiusOffset = (Math.random() - 0.5) * 1.5
    const r = 4.2 + radiusOffset
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

const updateAnimations = (elapsed: number, _delta: number) => {
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

  // Animate motivation elements
  if (visionRef.value) {
    visionRef.value.rotation.y = elapsed * 0.2
    visionRef.value.position.y = Math.sin(elapsed * 0.8) * 0.3
  }

  if (growthRef.value) {
    growthRef.value.rotation.y = -elapsed * 0.25
    const growthPulse = 1 + Math.sin(elapsed * 1.2) * 0.1
    growthRef.value.scale.set(growthPulse, growthPulse, growthPulse)
  }

  if (innovationRef.value) {
    innovationRef.value.rotation.y = elapsed * 0.3
    innovationRef.value.rotation.x = Math.sin(elapsed * 0.5) * 0.2
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
  const canvas = document.querySelector('[data-section="motivation"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }
  
  startTime = Date.now()
  createParticleSystems()
  
  // Start animation loop with controller
  animationController.start((_elapsed, delta) => {
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
const isMinimal = computed(() => props.quality === 'minimal')
</script>

<template>
  <TresPerspectiveCamera :position="[0, 4, 14]" :look-at="[0, 0, 0]" />

  <!-- Enhanced cinematic lighting -->
  <TresAmbientLight :intensity="0.25" />
  <!-- Central core light -->
  <TresPointLight :position="[0, 0, 0]" :intensity="3" :color="themeColors.primary" :distance="15" />
  <!-- Rim lights for depth -->
  <TresPointLight :position="[8, 4, -4]" :intensity="1.2" :color="themeColors.growth" :distance="20" />
  <TresPointLight :position="[-8, -3, -4]" :intensity="1" :color="themeColors.vision" :distance="20" />
  <TresPointLight :position="[0, -6, 6]" :intensity="0.8" :color="themeColors.energy" :distance="15" />
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

  <!-- Vision - Eye/Target -->
  <TresGroup ref="visionRef" :position="[-3, 2, 0]">
    <TresMesh>
      <TresRingGeometry :args="[0.4, 0.6, 16]" />
      <TresMeshStandardMaterial :color="themeColors.vision" :emissive="themeColors.vision" :emissive-intensity="0.7" />
    </TresMesh>
    <TresMesh>
      <TresSphereGeometry :args="[0.3, 16, 16]" />
      <TresMeshStandardMaterial :color="themeColors.primary" :emissive="themeColors.vision" :emissive-intensity="0.8" />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.8, 16, 16]" />
      <TresMeshBasicMaterial :color="themeColors.vision" :opacity="0.15" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Growth - Upward Arrow -->
  <TresGroup ref="growthRef" :position="[3, -1, 0]">
    <TresMesh :position="[0, 0.5, 0]">
      <TresConeGeometry :args="[0.3, 0.8, 8]" />
      <TresMeshStandardMaterial :color="themeColors.growth" :emissive="themeColors.growth" :emissive-intensity="0.7" />
    </TresMesh>
    <TresMesh :position="[0, -0.3, 0]">
      <TresCylinderGeometry :args="[0.15, 0.15, 0.4, 8]" />
      <TresMeshStandardMaterial :color="themeColors.growth" :emissive="themeColors.growth" :emissive-intensity="0.6" />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.7, 16, 16]" />
      <TresMeshBasicMaterial :color="themeColors.growth" :opacity="0.15" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Innovation - Spark -->
  <TresGroup ref="innovationRef" :position="[0, -3, 2]">
    <TresMesh :rotation="[0, 0, Math.PI / 4]">
      <TresOctahedronGeometry :args="[0.5, 0]" />
      <TresMeshStandardMaterial :color="themeColors.accent" :emissive="themeColors.accent" :emissive-intensity="0.8" />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.9, 16, 16]" />
      <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.15" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Orbital track visualization -->
  <TresGroup :rotation="[Math.PI / 2, 0, 0]">
    <!-- Primary orbit ring -->
    <TresMesh>
      <TresTorusGeometry :args="[4.2, 0.015, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.primary" :opacity="0.25" :transparent="true" />
    </TresMesh>
    <!-- Secondary orbital guides -->
    <TresMesh :rotation="[0.2, 0, 0]">
      <TresTorusGeometry :args="[4.6, 0.008, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.secondary" :opacity="0.12" :transparent="true" />
    </TresMesh>
    <TresMesh :rotation="[-0.15, 0, 0]">
      <TresTorusGeometry :args="[3.8, 0.008, 8, ringSegments]" />
      <TresMeshBasicMaterial :color="themeColors.accent" :opacity="0.1" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Particle systems -->
  <primitive v-if="dustParticles" :object="dustParticles" />
  <primitive v-if="energyParticles" :object="energyParticles" />
</template>

