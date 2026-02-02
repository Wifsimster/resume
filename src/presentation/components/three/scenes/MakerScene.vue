<script setup lang="ts">
import { ref, reactive, shallowRef, onMounted, onUnmounted, computed, watch } from 'vue'
import type { CameraMode } from '@application/composables/useMakerCamera'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'
import { useScreenTexture } from '@application/composables/useScreenTexture'
import { useMakerCamera } from '@application/composables/useMakerCamera'
import { useMakerAnimations } from '@application/composables/useMakerAnimations'
import { useMakerInteraction } from '@application/composables/useMakerInteraction'
import { useQuality } from '@application/composables/useQuality'
import { useTres } from '@tresjs/core'
import { rackUnits, makerColors } from '@domain/data/makerRack'
import DeskComponent from './maker/DeskComponent.vue'
import MonitorComponent from './maker/MonitorComponent.vue'
import KeyboardComponent from './maker/KeyboardComponent.vue'
import MouseComponent from './maker/MouseComponent.vue'
import ServerRackComponent from './maker/ServerRackComponent.vue'
import DustParticlesComponent, { type DustParticle } from './maker/DustParticlesComponent.vue'

const props = defineProps<{
  quality: QualityLevel
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
  title?: string
  subtitle?: string
}>()

const emit = defineEmits<{
  hoverUnit: [unitId: string | null]
  cameraModeChange: [mode: CameraMode]
}>()

// Screen texture
const { screenTexture } = useScreenTexture({
  title: props.title,
  subtitle: props.subtitle,
  projects: props.projects,
  techStack: props.techStack
})

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller
const animationController = useAnimationController(sectionElement)

const sceneRef = ref()
const serverUnitMeshes = ref<Map<string, any>>(new Map())
const rackMeshRef = ref<any>(null)
const dustParticlesRef = ref<{ updateInstances: () => void } | null>(null)

// Camera control state
const cameraOffset = reactive({
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
})

// Camera setup
const { cameraPosition, cameraLookAt, updateCamera, toggleMode, cameraMode } = useMakerCamera(cameraOffset)

// Get Tres context (camera and renderer) - this works because we're inside TresCanvas
const { camera, renderer } = useTres()

// Quality settings for performance optimization
const { renderSettings } = useQuality()

// Watch camera mode changes and emit event
watch(cameraMode, (newMode) => {
  emit('cameraModeChange', newMode)
}, { immediate: true })

// Expose camera controls and Tres context for parent component
defineExpose({
  toggleMode,
  cameraMode,
  camera,
  renderer
})

// Server rack configuration - adjust based on quality
const visibleRackUnits = computed(() => {
  if (props.quality === 'minimal') {
    return rackUnits.slice(0, 3) // Only 3 units in minimal
  } else if (props.quality === 'low') {
    return rackUnits.slice(0, 5) // 5 units in low
  }
  return rackUnits // All units in high
})

// Animation setup
const { anim, updateAnimations } = useMakerAnimations(
  visibleRackUnits,
  sceneRef,
  cameraOffset,
  updateCamera
)

// Interaction setup
const { hoveredUnitId } = useMakerInteraction(
  sceneRef,
  cameraOffset,
  serverUnitMeshes,
  (unitId) => emit('hoverUnit', unitId),
  rackMeshRef,
  toggleMode
)

// Dust particles - use shallowRef to avoid reactivity overhead
// Only regenerate when quality changes, not every frame
const dustParticles = shallowRef<DustParticle[]>([])

const generateDustParticles = () => {
  if (props.quality === 'minimal') {
    dustParticles.value = []
    return
  }
  const baseParticleCount = 30
  const particleCount = Math.floor(baseParticleCount * renderSettings.value.particleMultiplier)
  if (particleCount <= 0) {
    dustParticles.value = []
    return
  }

  dustParticles.value = Array.from({ length: particleCount }, () => ({
    x: -4 + Math.random() * 10,
    y: -0.5 + Math.random() * 4,
    z: -2 + Math.random() * 4,
    speed: 0.1 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2
  }))
}

// Only regenerate particles when quality changes
watch(() => props.quality, generateDustParticles, { immediate: true })

// Dust particle animation
const getDustPos = (particle: typeof dustParticles.value[0]) => {
  return {
    x: particle.x + Math.sin(anim.time * particle.speed + particle.phase) * 0.4,
    y: particle.y + Math.sin(anim.time * particle.speed * 0.7 + particle.phase) * 0.25,
    z: particle.z
  }
}

// Handle server rack unit refs
const handleUnitRef = (unitId: string, ref: any) => {
  if (ref) {
    serverUnitMeshes.value.set(unitId, ref)
  } else {
    serverUnitMeshes.value.delete(unitId)
  }
}

// Handle rack reference
const handleRackRef = (ref: any) => {
  if (ref) {
    rackMeshRef.value = ref
  }
}

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="maker"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }

  // Full animation with markRaw (non-reactive) anim object
  // Vue won't track anim changes, so no re-renders triggered
  animationController.start((elapsed, delta) => {
    updateAnimations(elapsed, delta)
    // Manually update dust particles since they use instanced rendering
    dustParticlesRef.value?.updateInstances()
  })
})

onUnmounted(() => {
  animationController.stop()
})
</script>

<template>
  <TresPerspectiveCamera :position="[cameraPosition.x, cameraPosition.y, cameraPosition.z]"
    :look-at="[cameraLookAt.x, cameraLookAt.y, cameraLookAt.z]" />

  <!-- Lighting - Enhanced for better visibility -->
  <TresAmbientLight :intensity="2.0" />

  <!-- Main key light - covers desk and monitor area -->
  <TresPointLight v-if="renderSettings.lightCount >= 2" :position="[0, 6, 5]" :intensity="8" color="#FFFFFF" />

  <!-- Monitor area accent light - combines screen glow and fill -->
  <TresPointLight v-if="renderSettings.lightCount >= 3" :position="[-2, 2.5, 0]" :intensity="5" :color="makerColors.screenGlow" />

  <!-- Server rack lighting - combines multiple rack lights into one strategic light -->
  <TresPointLight v-if="renderSettings.lightCount >= 4" :position="[3.5, 2, 0]" :intensity="8" :color="makerColors.serverBlue" />

  <!-- General fill light - covers remaining areas -->
  <TresDirectionalLight v-if="renderSettings.lightCount >= 5" :position="[2, 10, 5]" :intensity="4" color="#FFFFFF" />

  <!-- Additional high-quality lights -->
  <TresPointLight v-if="renderSettings.lightCount >= 6" :position="[0, 3, 2]" :intensity="3" :color="makerColors.wifi" />

  <!-- Rack area front fill light -->
  <TresPointLight v-if="renderSettings.lightCount >= 6" :position="[3, 1.5, 3]" :intensity="4" color="#FFFFFF" />

  <TresGroup ref="sceneRef">
    <DeskComponent :colors="makerColors" />
    <MonitorComponent :screen-texture="screenTexture" :colors="makerColors" />
    <KeyboardComponent :colors="makerColors" />
    <MouseComponent />
    <ServerRackComponent :visible-rack-units="visibleRackUnits" :hovered-unit-id="hoveredUnitId" :anim="anim"
      :colors="makerColors" @unit-ref="handleUnitRef" @rack-ref="handleRackRef" />
    <DustParticlesComponent v-if="dustParticles.length > 0" ref="dustParticlesRef"
      :dust-particles="dustParticles" :get-dust-pos="getDustPos" />

    <!-- ========== BACKDROP WALL ========== -->
    <!-- Using MeshBasicMaterial for performance - no PBR overhead -->
    <TresMesh :position="[1, 2, -2.5]">
      <TresPlaneGeometry :args="[16, 7]" />
      <TresMeshBasicMaterial :color="'#0A0A0A'" />
    </TresMesh>
  </TresGroup>

  <!-- ========== FLOOR ========== -->
  <!-- Using MeshBasicMaterial for performance - no PBR overhead -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[20, 16]" />
    <TresMeshBasicMaterial :color="'#080808'" />
  </TresMesh>
</template>
