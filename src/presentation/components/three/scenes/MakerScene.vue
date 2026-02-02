<script setup lang="ts">
import { ref, reactive, shallowRef, onMounted, onUnmounted, computed, watch, toRef } from 'vue'
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
  cameraMode: CameraMode
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
  title?: string
  subtitle?: string
}>()

const emit = defineEmits<{
  hoverUnit: [unitId: string | null]
}>()

// Convert prop to ref for composables
const cameraModeRef = toRef(props, 'cameraMode')

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
const dustParticlesRef = ref<{ updateInstances: () => void } | null>(null)

// Camera control state
const cameraOffset = reactive({
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
})

// Camera setup - mode is driven by parent via prop
const { cameraPosition, cameraLookAt, updateCamera } = useMakerCamera(cameraOffset, cameraModeRef)

// Get Tres context (camera and renderer) - this works because we're inside TresCanvas
const { camera, renderer } = useTres()

// Quality settings for performance optimization
const { renderSettings } = useQuality()

// Expose Tres context for parent component (RackLegend)
defineExpose({
  camera,
  renderer
})

// Server rack configuration - adjust based on quality
const visibleRackUnits = computed(() => {
  if (props.quality === 'minimal') {
    return rackUnits.slice(0, 3)
  } else if (props.quality === 'low') {
    return rackUnits.slice(0, 5)
  }
  return rackUnits
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
  cameraModeRef,
  serverUnitMeshes,
  (unitId) => emit('hoverUnit', unitId)
)

// Clear stale mesh references when mode changes (prevents raycasting against disposed objects)
watch(cameraModeRef, () => {
  serverUnitMeshes.value.clear()
})

// Dust particles - use shallowRef to avoid reactivity overhead
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


onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="maker"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }

  // Full animation with markRaw (non-reactive) anim object
  animationController.start((elapsed, delta) => {
    updateAnimations(elapsed, delta)
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

  <!-- Desk Lighting -->
  <TresAmbientLight v-if="cameraMode === 'desk'" :intensity="3.0" />
  <TresDirectionalLight v-if="cameraMode === 'desk'" :position="[2, 10, 5]" :intensity="6" color="#FFFFFF" />
  <TresPointLight v-if="cameraMode === 'desk'" :position="[-2, 4, 4]" :intensity="12" color="#FFFFFF" />
  <TresPointLight v-if="cameraMode === 'desk' && renderSettings.lightCount >= 3" :position="[-2, 2.5, 0]" :intensity="8" :color="makerColors.screenGlow" />
  <TresPointLight v-if="cameraMode === 'desk' && renderSettings.lightCount >= 4" :position="[0, 3, 2]" :intensity="5" :color="makerColors.wifi" />
  <TresPointLight v-if="cameraMode === 'desk' && renderSettings.lightCount >= 5" :position="[-3, 1, 3]" :intensity="4" color="#FFFFFF" />

  <!-- Rack Lighting (centered on rack at x=1.372) - boosted for dark metal materials -->
  <TresAmbientLight v-if="cameraMode === 'rack'" :intensity="5.0" />
  <TresDirectionalLight v-if="cameraMode === 'rack'" :position="[1.372, 8, 6]" :intensity="10" color="#FFFFFF" />
  <!-- Strong frontal key light -->
  <TresPointLight v-if="cameraMode === 'rack'" :position="[1.372, 1, 3.5]" :intensity="20" color="#FFFFFF" />
  <!-- Overhead light -->
  <TresPointLight v-if="cameraMode === 'rack'" :position="[1.372, 4, 1]" :intensity="15" color="#FFFFFF" />
  <!-- Blue accent from behind -->
  <TresPointLight v-if="cameraMode === 'rack' && renderSettings.lightCount >= 3" :position="[1.372, 1.5, -1]" :intensity="12" :color="makerColors.serverBlue" />
  <!-- Right side fill -->
  <TresPointLight v-if="cameraMode === 'rack' && renderSettings.lightCount >= 4" :position="[3, 0.5, 2]" :intensity="8" color="#FFFFFF" />
  <!-- Left side fill -->
  <TresPointLight v-if="cameraMode === 'rack' && renderSettings.lightCount >= 5" :position="[-0.3, 0.5, 2]" :intensity="8" color="#FFFFFF" />

  <TresGroup ref="sceneRef">
    <!-- Desk Animation -->
    <TresGroup v-if="cameraMode === 'desk'">
      <DeskComponent :colors="makerColors" />
      <MonitorComponent :screen-texture="screenTexture" :colors="makerColors" />
      <KeyboardComponent :colors="makerColors" />
      <MouseComponent />
    </TresGroup>

    <!-- Rack Animation -->
    <TresGroup v-if="cameraMode === 'rack'">
      <ServerRackComponent :visible-rack-units="visibleRackUnits" :hovered-unit-id="hoveredUnitId" :anim="anim"
        :colors="makerColors" @unit-ref="handleUnitRef" />
    </TresGroup>

    <!-- Shared: Dust Particles & Backdrop -->
    <DustParticlesComponent v-if="dustParticles.length > 0" ref="dustParticlesRef"
      :dust-particles="dustParticles" :get-dust-pos="getDustPos" />

    <TresMesh :position="[1, 2, -2.5]">
      <TresPlaneGeometry :args="[16, 7]" />
      <TresMeshBasicMaterial :color="'#0A0A0A'" />
    </TresMesh>
  </TresGroup>

  <!-- Floor -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[20, 16]" />
    <TresMeshBasicMaterial :color="'#080808'" />
  </TresMesh>
</template>
