<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { Raycaster, Vector2, CanvasTexture } from 'three'
import { useTres } from '@tresjs/core'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

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
const screenTexture = ref<CanvasTexture | null>(null)

// Create canvas texture for screen content
const createScreenTexture = () => {
  const canvas = document.createElement('canvas')
  const width = 1920
  const height = 1080
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Background
  ctx.fillStyle = '#0D1117'
  ctx.fillRect(0, 0, width, height)

  // Title
  ctx.fillStyle = '#B87333'
  ctx.font = 'bold 72px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(props.title || 'Maker', width / 2, 120)

  // Subtitle
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '32px sans-serif'
  ctx.globalAlpha = 0.7
  const subtitle = props.subtitle || 'J\'adore construire et expérimenter, voici quelques uns de mes projets...'
  const subtitleLines = subtitle.match(/.{1,60}/g) || [subtitle]
  subtitleLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 180 + i * 40)
  })
  ctx.globalAlpha = 1

  // Projects section
  ctx.fillStyle = '#B87333'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Projets', 80, 300)

  // Projects
  const projects = props.projects || []
  projects.forEach((project, idx) => {
    const x = 80 + (idx % 2) * 920
    const y = 380 + Math.floor(idx / 2) * 140

    // Project card background
    ctx.fillStyle = '#B87333'
    ctx.globalAlpha = 0.15
    ctx.fillRect(x, y - 60, 850, 100)
    ctx.globalAlpha = 1

    // Icon
    ctx.font = '40px sans-serif'
    ctx.fillText(project.icon, x + 25, y)

    // Label
    ctx.fillStyle = '#F5E6D3'
    ctx.font = '32px sans-serif'
    ctx.fillText(project.label, x + 80, y)

    // Year
    ctx.fillStyle = '#FFFFFF'
    ctx.globalAlpha = 0.4
    ctx.font = '24px sans-serif'
    ctx.fillText(project.year, x + 25, y + 40)
    ctx.globalAlpha = 1
  })

  // Tech Stack section
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 48px sans-serif'
  ctx.globalAlpha = 0.7
  ctx.fillText('Technologies', 80, 800)
  ctx.globalAlpha = 1

  // Tech Stack
  const techStack = props.techStack || []
  techStack.forEach((tech, idx) => {
    const x = 80 + (idx % 3) * 620
    const y = 880 + Math.floor(idx / 3) * 90

    // Tech badge background
    ctx.fillStyle = '#FFFFFF'
    ctx.globalAlpha = 0.1
    ctx.fillRect(x, y - 35, 580, 60)
    ctx.globalAlpha = 1

    // Icon
    ctx.font = '28px sans-serif'
    ctx.fillText(tech.icon, x + 20, y)

    // Label
    ctx.fillStyle = '#FFFFFF'
    ctx.globalAlpha = 0.6
    ctx.font = '26px sans-serif'
    ctx.fillText(tech.label, x + 65, y)
    ctx.globalAlpha = 1
  })

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Update texture when props change
watch(() => [props.projects, props.techStack, props.title, props.subtitle], () => {
  screenTexture.value = createScreenTexture()
}, { deep: true })

onMounted(() => {
  screenTexture.value = createScreenTexture()
})

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller
const animationController = useAnimationController(sectionElement)

const sceneRef = ref()
const { camera, renderer } = useTres()

// Mouse position for raycasting
const mouse = new Vector2()
const raycasterInstance = new Raycaster()

// Camera control state
const cameraOffset = reactive({
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
})

// Base camera position
const baseCameraPos = { x: -1.5, y: 1.3, z: 5.5 }
const baseLookAt = { x: -1, y: 1.6, z: 0 }

// Reactive camera position and look-at
const cameraPosition = reactive({ x: baseCameraPos.x, y: baseCameraPos.y, z: baseCameraPos.z })
const cameraLookAt = reactive({ x: baseLookAt.x, y: baseLookAt.y, z: baseLookAt.z })

// Server unit data structure
interface ServerUnit {
  id: string
  name: string
  description: string
  y: number
  height: number
  color: string
  type: 'udm-pro' | 'switch' | 'ap' | 'silver-1u' | 'pdu' | 'nas' | 'enclosure' | 'ups'
  meshRef?: any
}

// Server rack units matching actual equipment
const rackUnits: ServerUnit[] = [
  {
    id: 'udm-pro',
    name: 'maker.rackUnits.udmPro.name',
    description: 'maker.rackUnits.udmPro.description',
    y: 3.2,
    height: 0.45,
    color: '#FFFFFF',
    type: 'udm-pro'
  },
  {
    id: 'switch',
    name: 'maker.rackUnits.switch.name',
    description: 'maker.rackUnits.switch.description',
    y: 2.6,
    height: 0.45,
    color: '#FFFFFF',
    type: 'switch'
  },
  {
    id: 'ap',
    name: 'maker.rackUnits.ap.name',
    description: 'maker.rackUnits.ap.description',
    y: 2.2,
    height: 0.3,
    color: '#FFFFFF',
    type: 'ap'
  },
  {
    id: 'silver-1u',
    name: 'maker.rackUnits.silver1u.name',
    description: 'maker.rackUnits.silver1u.description',
    y: 1.7,
    height: 0.45,
    color: '#C0C0C0',
    type: 'silver-1u'
  },
  {
    id: 'pdu',
    name: 'maker.rackUnits.pdu.name',
    description: 'maker.rackUnits.pdu.description',
    y: 1.1,
    height: 0.5,
    color: '#1A1A1A',
    type: 'pdu'
  },
  {
    id: 'nas',
    name: 'maker.rackUnits.nas.name',
    description: 'maker.rackUnits.nas.description',
    y: 0.4,
    height: 0.6,
    color: '#1A1A1A',
    type: 'nas'
  },
  {
    id: 'enclosure',
    name: 'maker.rackUnits.enclosure.name',
    description: 'maker.rackUnits.enclosure.description',
    y: -0.3,
    height: 0.5,
    color: '#1A1A1A',
    type: 'enclosure'
  },
  {
    id: 'ups',
    name: 'maker.rackUnits.ups.name',
    description: 'maker.rackUnits.ups.description',
    y: -0.8,
    height: 0.5,
    color: '#1A1A1A',
    type: 'ups'
  }
]

// Hovered unit state
const hoveredUnitId = ref<string | null>(null)
const serverUnitMeshes = ref<Map<string, any>>(new Map())

// Theme colors
const colors = {
  electronics: '#00979D',
  led: '#FF6B35',
  wood: '#5D4037',
  wifi: '#03A9F4',
  serverBlue: '#1565C0',
  serverGreen: '#4CAF50',
  serverRed: '#F44336',
  metal: '#37474F',
  darkMetal: '#1A1A1A',
  screenGlow: '#6366F1'
}

// Animation state
let startTime = 0

const anim = reactive({
  time: 0,
  serverLeds: [] as number[],
  fanRotation: 0,
  hddActivity: 0,
  screenFlicker: [1] as number[]
})

// Server rack configuration - using actual rack units
const visibleRackUnits = computed(() =>
  props.quality === 'high' ? rackUnits : rackUnits.slice(0, 5)
)

// LED strip configuration (removed - not used)

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

// Screen content lines for each monitor (used for reference)
const _screenLines = [
  { count: 10, color: colors.serverGreen }, // Left - terminal
  { count: 12, color: colors.wifi },        // Center - code
  { count: 8, color: colors.led }           // Right - monitoring
]
void _screenLines // Suppress unused warning

// Animation loop
const updateAnimations = (elapsed: number, _delta: number) => {
  anim.time = elapsed

  // LED rainbow flow (removed - not used)

  // Server LEDs blinking pattern (kept for compatibility)
  anim.serverLeds = visibleRackUnits.value.map((_, i) => {
    return Math.sin(elapsed * (2 + i * 0.5) + i * 1.5) > 0.2 ? 1 : 0.15
  })

  // Fan rotation
  anim.fanRotation = elapsed * 8

  // HDD activity
  anim.hddActivity = Math.random() > 0.7 ? 1 : 0.1

  // Screen subtle flicker
  anim.screenFlicker = [
    0.95 + Math.sin(elapsed * 0.5) * 0.05,
    0.95 + Math.sin(elapsed * 0.7 + 1) * 0.05,
    0.95 + Math.sin(elapsed * 0.6 + 2) * 0.05
  ]

  // Scene subtle movement
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.04) * 0.06
    sceneRef.value.position.y = Math.sin(elapsed * 0.1) * 0.02
  }

  // Animated camera POV - circular motion with breathing effect
  // Smooth interpolation for mouse-based offset
  cameraOffset.x += (cameraOffset.targetX - cameraOffset.x) * 0.1
  cameraOffset.y += (cameraOffset.targetY - cameraOffset.y) * 0.1

  // Automatic circular animation
  const orbitRadius = 0.8
  const orbitSpeed = 0.15
  const autoX = Math.sin(elapsed * orbitSpeed) * orbitRadius
  const autoZ = Math.cos(elapsed * orbitSpeed) * orbitRadius

  // Breathing effect (vertical)
  const breathing = Math.sin(elapsed * 0.3) * 0.15

  // Combine automatic animation with user offset (limited range)
  const userOffsetX = cameraOffset.x * 0.3 // Limit user control to 30% of automatic range
  const userOffsetY = cameraOffset.y * 0.2

  // Calculate final camera position
  cameraPosition.x = baseCameraPos.x + autoX + userOffsetX
  cameraPosition.y = baseCameraPos.y + breathing + userOffsetY
  cameraPosition.z = baseCameraPos.z + autoZ

  // Look at point with slight offset based on mouse
  cameraLookAt.x = baseLookAt.x + cameraOffset.x * 0.15
  cameraLookAt.y = baseLookAt.y + cameraOffset.y * 0.1
  cameraLookAt.z = baseLookAt.z
}

// LED color with smooth gradient (removed - not used)

// Server LED state (unused but kept for potential future use)
const _getServerLedState = (serverIndex: number, ledIndex: number) => {
  const pattern = Math.sin(anim.time * (3 + ledIndex * 0.8) + serverIndex * 2 + ledIndex) > 0.3
  return pattern ? 1 : 0.15
}
void _getServerLedState // Suppress unused warning

// Dust particle animation
const getDustPos = (particle: typeof dustParticles.value[0]) => {
  return {
    x: particle.x + Math.sin(anim.time * particle.speed + particle.phase) * 0.4,
    y: particle.y + Math.sin(anim.time * particle.speed * 0.7 + particle.phase) * 0.25,
    z: particle.z
  }
}

// Mouse move handler for raycasting and camera control
const handleMouseMove = (event: MouseEvent) => {
  const rendererInstance = (renderer as any).value
  if (!camera.value || !rendererInstance || !sceneRef.value) return

  // Access renderer's domElement (TresJS compatibility)
  const canvas = rendererInstance.domElement
  const rect = canvas.getBoundingClientRect()

  // Calculate normalized device coordinates
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Update camera offset based on mouse position (limited range)
  cameraOffset.targetX = mouse.x * 0.5 // Limit to ±0.5
  cameraOffset.targetY = mouse.y * 0.3 // Limit to ±0.3

  // Update raycaster
  raycasterInstance.setFromCamera(mouse, camera.value)

  // Find intersections with server unit meshes
  const meshes = Array.from(serverUnitMeshes.value.values())
    .map(mesh => {
      // Get the actual Three.js object from TresJS ref
      return mesh?.value || mesh
    })
    .filter(Boolean)

  if (meshes.length === 0) return

  const intersects = raycasterInstance.intersectObjects(meshes, true)

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object
    // Traverse up to find the parent group
    let current = intersectedObject
    let unitId: string | null = null

    // Check if this object or any parent is in our map
    while (current && !unitId) {
      const currentObj = current
      unitId = Array.from(serverUnitMeshes.value.entries())
        .find(([_, mesh]) => {
          const meshObj = mesh?.value || mesh
          return meshObj === currentObj || (meshObj && meshObj.children && meshObj.children.includes(currentObj))
        })?.[0] || null
      // @ts-expect-error - parent can be null, but while loop handles it
      current = current.parent
    }

    if (unitId && unitId !== hoveredUnitId.value) {
      hoveredUnitId.value = unitId
      emit('hoverUnit', unitId)
    }
  } else {
    if (hoveredUnitId.value !== null) {
      hoveredUnitId.value = null
      emit('hoverUnit', null)
    }
  }
}

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

  // Add mouse move listener for raycasting
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  animationController.stop()
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <TresPerspectiveCamera :position="[cameraPosition.x, cameraPosition.y, cameraPosition.z]"
    :look-at="[cameraLookAt.x, cameraLookAt.y, cameraLookAt.z]" />

  <!-- Enhanced Lighting -->
  <TresAmbientLight :intensity="1.0" />
  <TresPointLight :position="[0, 6, 5]" :intensity="4.5" color="#FFFFFF" />
  <!-- Monitor area lighting -->
  <TresPointLight :position="[-2, 2.5, 0]" :intensity="2.5" :color="colors.screenGlow" />
  <TresPointLight :position="[-1, 2.5, -0.5]" :intensity="2" color="#FFFFFF" />
  <TresPointLight :position="[1, 2.5, -0.5]" :intensity="2" color="#FFFFFF" />
  <!-- Server rack lighting -->
  <TresPointLight :position="[3.5, 2, 0]" :intensity="4" :color="colors.serverBlue" />
  <TresPointLight :position="[3, 1, 1]" :intensity="3" :color="colors.serverGreen" />
  <TresPointLight :position="[4, 3, 0]" :intensity="3" color="#FFFFFF" />
  <TresPointLight :position="[3.5, 2.5, 0.5]" :intensity="2.5" color="#FFFFFF" />
  <!-- General fill lights -->
  <TresPointLight :position="[0, 3, 2]" :intensity="1.5" :color="colors.wifi" />
  <TresPointLight :position="[-2, 1, 3]" :intensity="1.5" color="#FFFFFF" />
  <TresPointLight :position="[0, 0.5, 2]" :intensity="1.2" color="#FFFFFF" />
  <TresDirectionalLight :position="[2, 10, 5]" :intensity="2.5" color="#FFFFFF" />
  <TresDirectionalLight :position="[-3, 8, 3]" :intensity="2" color="#FFFFFF" />

  <TresGroup ref="sceneRef">

    <!-- ========== LARGE DESK ========== -->
    <TresGroup :position="[-2, 0, 0.5]">
      <!-- Desktop surface -->
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[6, 0.1, 2.5]" />
        <TresMeshStandardMaterial :color="colors.wood" :roughness="0.75" :metalness="0.05" />
      </TresMesh>

      <!-- Desk legs -->
      <TresMesh v-for="(pos, i) in [[-2.8, -0.9, -1], [2.8, -0.9, -1], [-2.8, -0.9, 1], [2.8, -0.9, 1]] as const"
        :key="`leg-${i}`" :position="pos">
        <TresBoxGeometry :args="[0.1, 1.7, 0.1]" />
        <TresMeshStandardMaterial :color="colors.metal" :metalness="0.7" />
      </TresMesh>

      <!-- Desk edge trim -->
      <TresMesh :position="[0, 0, 1.3]">
        <TresBoxGeometry :args="[6, 0.1, 0.08]" />
        <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.7" />
      </TresMesh>
    </TresGroup>

    <!-- ========== 32 INCH MONITOR ========== -->
    <TresGroup :position="[-2, 1.8, -1]">
      <!-- Monitor frame (32 inch, 16:9 ratio) -->
      <TresMesh>
        <TresBoxGeometry :args="[5.5, 3.1, 0.12]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :roughness="0.25" />
      </TresMesh>

      <!-- Screen with content texture -->
      <TresMesh :position="[0, 0, 0.065]">
        <TresPlaneGeometry :args="[5.3, 2.98]" />
        <TresMeshBasicMaterial :map="screenTexture" />
      </TresMesh>
    </TresGroup>

    <!-- ========== 75% MECHANICAL KEYBOARD (White/Blue theme) ========== -->
    <TresGroup :position="[-2, 0.08, 0.8]">
      <!-- Main keyboard body - white/cream -->
      <TresMesh>
        <TresBoxGeometry :args="[1.7, 0.07, 0.55]" />
        <TresMeshStandardMaterial :color="'#E8E4DC'" :roughness="0.4" :metalness="0.1" />
      </TresMesh>

      <!-- Keyboard top bezel -->
      <TresMesh :position="[0, 0.04, 0]">
        <TresBoxGeometry :args="[1.65, 0.015, 0.5]" />
        <TresMeshStandardMaterial :color="'#F0EDE5'" :roughness="0.35" :metalness="0.05" />
      </TresMesh>

      <!-- ===== ROTARY KNOB (top right) ===== -->
      <TresGroup :position="[0.72, 0.06, -0.2]">
        <!-- Knob base -->
        <TresMesh>
          <TresCylinderGeometry :args="[0.055, 0.055, 0.03, 24]" />
          <TresMeshStandardMaterial :color="'#C0C0C0'" :roughness="0.2" :metalness="0.8" />
        </TresMesh>
        <!-- Knob top -->
        <TresMesh :position="[0, 0.025, 0]">
          <TresCylinderGeometry :args="[0.05, 0.05, 0.02, 24]" />
          <TresMeshStandardMaterial :color="'#A0A0A0'" :roughness="0.15" :metalness="0.9" />
        </TresMesh>
        <!-- Knob grip lines -->
        <TresMesh v-for="line in 12" :key="`knob-${line}`"
          :position="[Math.cos(line * Math.PI / 6) * 0.048, 0.025, Math.sin(line * Math.PI / 6) * 0.048]">
          <TresBoxGeometry :args="[0.004, 0.015, 0.008]" />
          <TresMeshStandardMaterial :color="'#707070'" :metalness="0.7" />
        </TresMesh>
      </TresGroup>

      <!-- ===== ESCAPE KEY (dark navy) ===== -->
      <TresMesh :position="[-0.75, 0.055, -0.2]">
        <TresBoxGeometry :args="[0.08, 0.035, 0.065]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.5" />
      </TresMesh>

      <!-- ===== FUNCTION ROW ===== -->
      <!-- F1-F4 (light) -->
      <TresMesh v-for="key in 4" :key="`f1-4-${key}`" :position="[-0.58 + key * 0.095, 0.055, -0.2]">
        <TresBoxGeometry :args="[0.07, 0.03, 0.055]" />
        <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
      </TresMesh>
      <!-- F5-F8 (gray-blue) -->
      <TresMesh v-for="key in 4" :key="`f5-8-${key}`" :position="[-0.2 + key * 0.095, 0.055, -0.2]">
        <TresBoxGeometry :args="[0.07, 0.03, 0.055]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- F9-F12 (light) -->
      <TresMesh v-for="key in 4" :key="`f9-12-${key}`" :position="[0.18 + key * 0.095, 0.055, -0.2]">
        <TresBoxGeometry :args="[0.07, 0.03, 0.055]" />
        <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
      </TresMesh>

      <!-- ===== NUMBER ROW (white keys) ===== -->
      <TresMesh v-for="key in 13" :key="`num-${key}`" :position="[-0.72 + key * 0.095, 0.055, -0.1]">
        <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
      </TresMesh>
      <!-- Backspace (gray-blue) -->
      <TresMesh :position="[0.58, 0.055, -0.1]">
        <TresBoxGeometry :args="[0.12, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Delete -->
      <TresMesh :position="[0.72, 0.055, -0.1]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>

      <!-- ===== QWERTY ROW ===== -->
      <!-- Tab (gray-blue) -->
      <TresMesh :position="[-0.75, 0.055, 0]">
        <TresBoxGeometry :args="[0.1, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Letter keys (white) -->
      <TresMesh v-for="key in 12" :key="`qwerty-${key}`" :position="[-0.6 + key * 0.095, 0.055, 0]">
        <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
      </TresMesh>
      <!-- PgUp -->
      <TresMesh :position="[0.72, 0.055, 0]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>

      <!-- ===== HOME ROW ===== -->
      <!-- Caps Lock (gray-blue) -->
      <TresMesh :position="[-0.73, 0.055, 0.09]">
        <TresBoxGeometry :args="[0.12, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Letter keys (white) -->
      <TresMesh v-for="key in 10" :key="`home-${key}`" :position="[-0.55 + key * 0.095, 0.055, 0.09]">
        <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
      </TresMesh>
      <!-- Enter (dark navy) -->
      <TresMesh :position="[0.52, 0.055, 0.09]">
        <TresBoxGeometry :args="[0.14, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
      </TresMesh>
      <!-- PgDn -->
      <TresMesh :position="[0.72, 0.055, 0.09]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>

      <!-- ===== BOTTOM ROW ===== -->
      <!-- Left Shift (gray-blue) -->
      <TresMesh :position="[-0.7, 0.055, 0.18]">
        <TresBoxGeometry :args="[0.15, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Letter keys (white) -->
      <TresMesh v-for="key in 9" :key="`shift-row-${key}`" :position="[-0.5 + key * 0.095, 0.055, 0.18]">
        <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
      </TresMesh>
      <!-- Right Shift -->
      <TresMesh :position="[0.45, 0.055, 0.18]">
        <TresBoxGeometry :args="[0.1, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Up arrow (dark) -->
      <TresMesh :position="[0.58, 0.055, 0.18]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
      </TresMesh>

      <!-- ===== SPACE ROW ===== -->
      <!-- Ctrl, Win, Alt (gray-blue) -->
      <TresMesh v-for="(_key, i) in 3" :key="`mod-left-${i}`" :position="[-0.7 + i * 0.1, 0.055, 0.27]">
        <TresBoxGeometry :args="[0.08, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Spacebar (dark navy) -->
      <TresMesh :position="[-0.1, 0.055, 0.27]">
        <TresBoxGeometry :args="[0.45, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
      </TresMesh>
      <!-- Fn, Ctrl right (gray-blue) -->
      <TresMesh v-for="(_key, i) in 2" :key="`mod-right-${i}`" :position="[0.22 + i * 0.1, 0.055, 0.27]">
        <TresBoxGeometry :args="[0.08, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
      </TresMesh>
      <!-- Arrow keys (dark) -->
      <TresMesh :position="[0.45, 0.055, 0.27]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
      </TresMesh>
      <TresMesh :position="[0.58, 0.055, 0.27]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
      </TresMesh>
      <TresMesh :position="[0.71, 0.055, 0.27]">
        <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
        <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
      </TresMesh>

    </TresGroup>

    <!-- ========== SIMPLE WIRELESS MOUSE ========== -->
    <TresGroup :position="[-0.5, 0.05, 0.85]">
      <!-- Main body -->
      <TresMesh>
        <TresBoxGeometry :args="[0.28, 0.1, 0.45]" />
        <TresMeshStandardMaterial :color="'#4A4A4A'" :roughness="0.4" :metalness="0.1" />
      </TresMesh>

      <!-- Top curved part -->
      <TresMesh :position="[0, 0.04, 0.03]">
        <TresBoxGeometry :args="[0.26, 0.04, 0.38]" />
        <TresMeshStandardMaterial :color="'#4D4D4D'" :roughness="0.35" :metalness="0.1" />
      </TresMesh>

      <!-- Left click -->
      <TresMesh :position="[-0.055, 0.075, -0.1]">
        <TresBoxGeometry :args="[0.1, 0.015, 0.2]" />
        <TresMeshStandardMaterial :color="'#3D3D3D'" :roughness="0.3" />
      </TresMesh>

      <!-- Right click -->
      <TresMesh :position="[0.055, 0.075, -0.1]">
        <TresBoxGeometry :args="[0.1, 0.015, 0.2]" />
        <TresMeshStandardMaterial :color="'#3D3D3D'" :roughness="0.3" />
      </TresMesh>

      <!-- Scroll wheel -->
      <TresMesh :position="[0, 0.08, -0.08]" :rotation="[Math.PI / 2, 0, 0]">
        <TresCylinderGeometry :args="[0.025, 0.025, 0.03, 16]" />
        <TresMeshStandardMaterial :color="'#606060'" :roughness="0.3" :metalness="0.5" />
      </TresMesh>
    </TresGroup>

    <!-- ========== BIG MOUSEPAD ========== -->
    <TresGroup :position="[-2, 0.06, 1]">
      <TresMesh>
        <TresBoxGeometry :args="[4.2, 0.025, 1.2]" />
        <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0" />
      </TresMesh>
    </TresGroup>


    <!-- ========== SERVER RACK ========== -->
    <TresGroup :position="[3, 0, -0.5]">

      <!-- Rack frame -->
      <TresMesh :position="[0, 1.2, 0]">
        <TresBoxGeometry :args="[1.8, 4, 1.2]" />
        <TresMeshStandardMaterial :color="'#212121'" :roughness="0.4" :metalness="0.7" />
      </TresMesh>

      <!-- Rack front panel -->
      <TresMesh :position="[0, 1.2, 0.62]">
        <TresBoxGeometry :args="[1.7, 3.9, 0.02]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.3" :metalness="0.8" />
      </TresMesh>

      <!-- Ventilation holes pattern -->
      <TresMesh v-for="(_row, ri) in 12" :key="`vent-row-${ri}`" :position="[-0.5, -0.4 + ri * 0.28, 0.64]">
        <TresPlaneGeometry :args="[0.3, 0.08]" />
        <TresMeshBasicMaterial :color="'#0A0A0A'" />
      </TresMesh>

      <!-- Server units - Actual equipment -->
      <TresGroup v-for="unit in visibleRackUnits" :key="`unit-${unit.id}`" :position="[0, unit.y, 0.4]" :ref="(el: any) => {
        if (el && el.value) {
          serverUnitMeshes.set(unit.id, el.value)
        } else if (el) {
          serverUnitMeshes.set(unit.id, el)
        }
      }">
        <!-- Unit chassis with hover effect -->
        <TresMesh>
          <TresBoxGeometry :args="[1.5, unit.height, 0.7]" />
          <TresMeshStandardMaterial :color="hoveredUnitId === unit.id ? '#B87333' : unit.color" :roughness="0.35"
            :metalness="unit.type === 'silver-1u' ? 0.8 : 0.6"
            :emissive="hoveredUnitId === unit.id ? '#B87333' : '#000000'"
            :emissive-intensity="hoveredUnitId === unit.id ? 0.2 : 0" />
        </TresMesh>

        <!-- Unit front plate -->
        <TresMesh :position="[0, 0, 0.36]">
          <TresBoxGeometry :args="[1.45, unit.height - 0.1, 0.02]" />
          <TresMeshStandardMaterial
            :color="unit.type === 'pdu' ? '#1A1A1A' : unit.color === '#FFFFFF' ? '#F5F5F5' : '#1A1A1A'"
            :roughness="0.25" :metalness="0.8" />
        </TresMesh>

        <!-- UDM Pro specific details -->
        <template v-if="unit.type === 'udm-pro'">
          <!-- Status LED -->
          <TresMesh :position="[0.6, 0.1, 0.38]">
            <TresSphereGeometry :args="[0.03, 8, 8]" />
            <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.9" :transparent="true" />
          </TresMesh>
          <!-- Small display area -->
          <TresMesh :position="[-0.3, 0, 0.37]">
            <TresPlaneGeometry :args="[0.4, 0.15]" />
            <TresMeshBasicMaterial :color="'#0A0A0A'" />
          </TresMesh>
        </template>

        <!-- Switch specific details -->
        <template v-if="unit.type === 'switch'">
          <!-- Ethernet ports with indicator lights -->
          <TresMesh v-for="port in 12" :key="`port-${port}`"
            :position="[-0.6 + (port % 6) * 0.2, -0.15 + Math.floor(port / 6) * 0.3, 0.37]">
            <TresBoxGeometry :args="[0.08, 0.06, 0.02]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" />
          </TresMesh>
          <!-- Port indicator lights -->
          <TresMesh v-for="led in 12" :key="`switch-led-${led}`"
            :position="[-0.6 + (led % 6) * 0.2, -0.12 + Math.floor(led / 6) * 0.3, 0.38]">
            <TresSphereGeometry :args="[0.015, 6, 6]" />
            <TresMeshBasicMaterial :color="led % 3 === 0 ? colors.serverGreen : colors.wifi"
              :opacity="Math.sin(anim.time * (2 + led * 0.3) + led) > 0.3 ? 1 : 0.3" :transparent="true" />
          </TresMesh>
        </template>

        <!-- Access Point specific details -->
        <template v-if="unit.type === 'ap'">
          <!-- Circular AP design -->
          <TresMesh :position="[0, 0, 0.36]">
            <TresCylinderGeometry :args="[0.3, 0.3, 0.02, 32]" />
            <TresMeshStandardMaterial :color="'#FFFFFF'" :roughness="0.3" />
          </TresMesh>
          <!-- Status LED -->
          <TresMesh :position="[0, 0.1, 0.38]">
            <TresSphereGeometry :args="[0.02, 8, 8]" />
            <TresMeshBasicMaterial :color="colors.wifi" :opacity="0.9" :transparent="true" />
          </TresMesh>
        </template>

        <!-- Silver 1U device -->
        <template v-if="unit.type === 'silver-1u'">
          <!-- Status LEDs -->
          <TresMesh :position="[0.5, 0.08, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.9" :transparent="true" />
          </TresMesh>
        </template>

        <!-- PDU specific details -->
        <template v-if="unit.type === 'pdu'">
          <!-- 8 red illuminated rocker switches -->
          <TresMesh v-for="switchNum in 8" :key="`pdu-switch-${switchNum}`"
            :position="[-0.6 + switchNum * 0.15, 0, 0.37]">
            <TresBoxGeometry :args="[0.1, 0.08, 0.02]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" />
          </TresMesh>
          <!-- Red illuminated switches -->
          <TresMesh v-for="switchNum in 8" :key="`pdu-led-${switchNum}`"
            :position="[-0.6 + switchNum * 0.15, 0.05, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="'#F44336'" :opacity="0.9" :transparent="true" />
          </TresMesh>
        </template>

        <!-- NAS (SilverStone) specific details -->
        <template v-if="unit.type === 'nas'">
          <!-- SilverStone logo area -->
          <TresMesh :position="[0.5, 0, 0.37]">
            <TresPlaneGeometry :args="[0.2, 0.1]" />
            <TresMeshBasicMaterial :color="'#2D2D2D'" />
          </TresMesh>
          <!-- Blue LED indicators -->
          <TresMesh v-for="led in 4" :key="`nas-led-${led}`" :position="[-0.5 + led * 0.25, 0.15, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="colors.serverBlue"
              :opacity="Math.sin(anim.time * (2 + led) + led) > 0.3 ? 1 : 0.4" :transparent="true" />
          </TresMesh>
          <!-- Drive bays -->
          <TresMesh v-for="bay in 4" :key="`nas-bay-${bay}`" :position="[-0.5 + bay * 0.25, -0.15, 0.37]">
            <TresBoxGeometry :args="[0.18, 0.12, 0.02]" />
            <TresMeshStandardMaterial :color="'#2D2D2D'" :metalness="0.5" />
          </TresMesh>
        </template>

        <!-- Enclosure specific details -->
        <template v-if="unit.type === 'enclosure'">
          <!-- Blue indicator lights in two rows -->
          <TresMesh v-for="led in 8" :key="`enclosure-led-${led}`"
            :position="[-0.4 + (led % 4) * 0.25, 0.1 - Math.floor(led / 4) * 0.2, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="colors.serverBlue"
              :opacity="Math.sin(anim.time * (1.5 + led * 0.2) + led) > 0.3 ? 1 : 0.3" :transparent="true" />
          </TresMesh>
        </template>

        <!-- UPS specific details -->
        <template v-if="unit.type === 'ups'">
          <!-- Status display -->
          <TresMesh :position="[0, 0.1, 0.37]">
            <TresPlaneGeometry :args="[0.4, 0.15]" />
            <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.8" :transparent="true" />
          </TresMesh>
          <!-- Battery status LEDs -->
          <TresMesh v-for="bat in 5" :key="`ups-bat-${bat}`" :position="[-0.5 + bat * 0.12, -0.1, 0.38]">
            <TresSphereGeometry :args="[0.02, 6, 6]" />
            <TresMeshBasicMaterial :color="bat < 4 ? colors.serverGreen : colors.led" :opacity="bat < 4 ? 0.9 : 0.3"
              :transparent="true" />
          </TresMesh>
        </template>
      </TresGroup>

      <!-- Rack rails -->
      <TresMesh :position="[-0.85, 1.2, 0.3]">
        <TresBoxGeometry :args="[0.04, 3.8, 0.04]" />
        <TresMeshStandardMaterial :color="'#424242'" :metalness="0.8" />
      </TresMesh>
      <TresMesh :position="[0.85, 1.2, 0.3]">
        <TresBoxGeometry :args="[0.04, 3.8, 0.04]" />
        <TresMeshStandardMaterial :color="'#424242'" :metalness="0.8" />
      </TresMesh>

      <!-- Top cooling unit -->
      <TresGroup :position="[0, 3.4, 0]">
        <TresMesh>
          <TresBoxGeometry :args="[1.6, 0.3, 1]" />
          <TresMeshStandardMaterial :color="'#1A1A1A'" :metalness="0.6" />
        </TresMesh>
        <!-- Fans -->
        <TresGroup v-for="fan in 2" :key="`top-fan-${fan}`" :position="[-0.4 + fan * 0.8, 0.16, 0]"
          :rotation="[-Math.PI / 2, 0, anim.fanRotation * (fan % 2 === 0 ? 1 : -1)]">
          <TresMesh>
            <TresCircleGeometry :args="[0.25, 16]" />
            <TresMeshStandardMaterial :color="'#2D2D2D'" />
          </TresMesh>
          <TresMesh :position="[0, 0, 0.01]">
            <TresRingGeometry :args="[0.05, 0.22, 16]" />
            <TresMeshBasicMaterial :color="'#37474F'" />
          </TresMesh>
          <!-- Fan blades -->
          <TresMesh v-for="blade in 5" :key="`blade-${fan}-${blade}`" :rotation="[0, 0, blade * (Math.PI * 2 / 5)]">
            <TresPlaneGeometry :args="[0.04, 0.18]" />
            <TresMeshBasicMaterial :color="'#455A64'" :side="2" />
          </TresMesh>
        </TresGroup>
      </TresGroup>

      <!-- Rear network ports glow -->
      <TresGroup :position="[0, 2.6, -0.65]">
        <TresMesh v-for="port in 4" :key="`net-port-${port}`" :position="[-0.4 + port * 0.25, 0, 0]">
          <TresSphereGeometry :args="[0.03, 6, 6]" />
          <TresMeshBasicMaterial :color="port % 2 === 0 ? colors.serverGreen : colors.led"
            :opacity="Math.sin(anim.time * (5 + port) + port * 2) > 0.3 ? 1 : 0.2" :transparent="true" />
        </TresMesh>
      </TresGroup>

      <!-- UPS unit at bottom -->
      <TresGroup :position="[0, -0.8, 0]">
        <TresMesh>
          <TresBoxGeometry :args="[1.5, 0.5, 1]" />
          <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.4" />
        </TresMesh>
        <TresMesh :position="[0, 0.1, 0.52]">
          <TresPlaneGeometry :args="[0.4, 0.15]" />
          <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.8" :transparent="true" />
        </TresMesh>
        <!-- Battery status LEDs -->
        <TresMesh v-for="bat in 5" :key="`bat-${bat}`" :position="[-0.5 + bat * 0.12, -0.1, 0.52]">
          <TresSphereGeometry :args="[0.02, 6, 6]" />
          <TresMeshBasicMaterial :color="bat < 4 ? colors.serverGreen : colors.led" :opacity="bat < 4 ? 0.9 : 0.3"
            :transparent="true" />
        </TresMesh>
      </TresGroup>

    </TresGroup>

    <!-- ========== ATMOSPHERE DUST ========== -->
    <TresMesh v-for="(dust, i) in dustParticles" :key="`dust-${i}`"
      :position="[getDustPos(dust).x, getDustPos(dust).y, getDustPos(dust).z]">
      <TresSphereGeometry :args="[0.01, 4, 4]" />
      <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.1" :transparent="true" />
    </TresMesh>

    <!-- ========== BACKDROP WALL ========== -->
    <TresMesh :position="[1, 2, -2.5]">
      <TresPlaneGeometry :args="[16, 7]" />
      <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :emissive="colors.serverBlue"
        :emissive-intensity="0.015" />
    </TresMesh>

  </TresGroup>

  <!-- ========== FLOOR ========== -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[20, 16]" />
    <TresMeshStandardMaterial :color="'#080808'" :roughness="0.75" :emissive="colors.metal"
      :emissive-intensity="0.01" />
  </TresMesh>
</template>
