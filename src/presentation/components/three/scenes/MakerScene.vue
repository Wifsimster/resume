<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'
import { useScreenTexture } from '@application/composables/useScreenTexture'
import { useMakerCamera } from '@application/composables/useMakerCamera'
import { useMakerAnimations } from '@application/composables/useMakerAnimations'
import { useMakerInteraction } from '@application/composables/useMakerInteraction'
import { rackUnits, makerColors } from '@domain/data/makerRack'
import DeskComponent from './maker/DeskComponent.vue'
import MonitorComponent from './maker/MonitorComponent.vue'
import KeyboardComponent from './maker/KeyboardComponent.vue'
import MouseComponent from './maker/MouseComponent.vue'
import ServerRackComponent from './maker/ServerRackComponent.vue'
import DustParticlesComponent from './maker/DustParticlesComponent.vue'

const props = defineProps<{
  quality: QualityLevel
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
  title?: string
  subtitle?: string
}>()

const emit = defineEmits<{
  hoverUnit: [unitId: string | null]
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

// Camera control state
const cameraOffset = reactive({
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
})

// Camera setup
const { cameraPosition, cameraLookAt, updateCamera } = useMakerCamera(cameraOffset)

// Server rack configuration
const visibleRackUnits = computed(() =>
  props.quality === 'high' ? rackUnits : rackUnits.slice(0, 5)
)

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
  (unitId) => emit('hoverUnit', unitId)
)

// Dust particles
const dustParticles = computed(() => {
  if (props.quality !== 'high') return []
  return Array.from({ length: 30 }, () => ({
    x: -4 + Math.random() * 10,
    y: -0.5 + Math.random() * 4,
    z: -2 + Math.random() * 4,
    speed: 0.1 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2
  }))
})

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

let startTime = 0

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="maker"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }

  startTime = Date.now()

  // Start animation loop with controller
  animationController.start((_elapsed, delta) => {
    const totalElapsed = (Date.now() - startTime) / 1000
    updateAnimations(totalElapsed, delta)
  })
})

onUnmounted(() => {
  animationController.stop()
})
</script>

<template>
  <TresPerspectiveCamera :position="[cameraPosition.x, cameraPosition.y, cameraPosition.z]"
    :look-at="[cameraLookAt.x, cameraLookAt.y, cameraLookAt.z]" />

  <!-- Enhanced Lighting -->
  <TresAmbientLight :intensity="1.0" />
  <TresPointLight :position="[0, 6, 5]" :intensity="4.5" color="#FFFFFF" />
  <!-- Monitor area lighting -->
  <TresPointLight :position="[-2, 2.5, 0]" :intensity="2.5" :color="makerColors.screenGlow" />
  <TresPointLight :position="[-1, 2.5, -0.5]" :intensity="2" color="#FFFFFF" />
  <TresPointLight :position="[1, 2.5, -0.5]" :intensity="2" color="#FFFFFF" />
  <!-- Server rack lighting -->
  <TresPointLight :position="[3.5, 2, 0]" :intensity="4" :color="makerColors.serverBlue" />
  <TresPointLight :position="[3, 1, 1]" :intensity="3" :color="makerColors.serverGreen" />
  <TresPointLight :position="[4, 3, 0]" :intensity="3" color="#FFFFFF" />
  <TresPointLight :position="[3.5, 2.5, 0.5]" :intensity="2.5" color="#FFFFFF" />
  <!-- General fill lights -->
  <TresPointLight :position="[0, 3, 2]" :intensity="1.5" :color="makerColors.wifi" />
  <TresPointLight :position="[-2, 1, 3]" :intensity="1.5" color="#FFFFFF" />
  <TresPointLight :position="[0, 0.5, 2]" :intensity="1.2" color="#FFFFFF" />
  <TresDirectionalLight :position="[2, 10, 5]" :intensity="2.5" color="#FFFFFF" />
  <TresDirectionalLight :position="[-3, 8, 3]" :intensity="2" color="#FFFFFF" />

  <TresGroup ref="sceneRef">
    <DeskComponent :colors="makerColors" />
    <MonitorComponent :screen-texture="screenTexture" :colors="makerColors" />
    <KeyboardComponent :colors="makerColors" />
    <MouseComponent />
    <ServerRackComponent :visible-rack-units="visibleRackUnits" :hovered-unit-id="hoveredUnitId" :anim="anim"
      :colors="makerColors" @unit-ref="handleUnitRef" />
    <DustParticlesComponent v-if="dustParticles.length > 0" :dust-particles="dustParticles"
      :get-dust-pos="getDustPos" />

    <!-- ========== BACKDROP WALL ========== -->
    <TresMesh :position="[1, 2, -2.5]">
      <TresPlaneGeometry :args="[16, 7]" />
      <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :emissive="makerColors.serverBlue"
        :emissive-intensity="0.015" />
    </TresMesh>
  </TresGroup>

  <!-- ========== FLOOR ========== -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[20, 16]" />
    <TresMeshStandardMaterial :color="'#080808'" :roughness="0.75" :emissive="makerColors.metal"
      :emissive-intensity="0.01" />
  </TresMesh>
</template>
