<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'
import { useAnimationController } from '@application/composables/useAnimationController'

defineProps<{
  quality: QualityLevel
}>()

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller
const animationController = useAnimationController(sectionElement)

const orbitGroupRef = ref()

// Category config with vertical offset for better visibility
const categoryConfig: Record<string, { color: string, orbitRadius: number, speed: number, yOffset: number }> = {
  frontend: { color: '#42B883', orbitRadius: 1.2, speed: 0.08, yOffset: 0.6 },
  backend: { color: '#61DAFB', orbitRadius: 1.8, speed: -0.06, yOffset: 0.2 },
  devops: { color: '#FF6B35', orbitRadius: 2.4, speed: 0.05, yOffset: -0.2 },
  soft: { color: '#FFD93D', orbitRadius: 3.0, speed: -0.04, yOffset: -0.6 }
}

// Build skill nodes from actual resume data
const skillNodes = computed(() => {
  const nodesByCategory: Record<string, typeof resumeData.skills> = {
    frontend: [],
    backend: [],
    devops: [],
    soft: []
  }
  
  // Group skills by category
  resumeData.skills.forEach(skill => {
    if (nodesByCategory[skill.category]) {
      nodesByCategory[skill.category].push(skill)
    }
  })
  
  // Create positioned nodes
  const nodes: Array<{
    id: string
    name: string
    color: string
    orbitRadius: number
    angle: number
    speed: number
    size: number
    yOffset: number
  }> = []
  
  Object.entries(nodesByCategory).forEach(([category, skills]) => {
    const config = categoryConfig[category]
    skills.forEach((skill, i) => {
      const angle = (i / skills.length) * Math.PI * 2
      nodes.push({
        id: skill.id,
        name: skill.name,
        color: config.color,
        orbitRadius: config.orbitRadius,
        angle,
        speed: config.speed,
        size: 0.12,
        yOffset: config.yOffset
      })
    })
  })
  
  return nodes
})

// Reactive states for positions
const nodeStates = reactive(
  skillNodes.value.map((node) => ({
    x: Math.cos(node.angle) * node.orbitRadius,
    y: node.yOffset,
    z: Math.sin(node.angle) * node.orbitRadius
  }))
)

// Core rotation
const coreState = reactive({
  rotationY: 0
})

// Category orbit rings with tilt
const orbitRings = computed(() => 
  Object.entries(categoryConfig).map(([id, config]) => ({
    id,
    radius: config.orbitRadius,
    color: config.color,
    yOffset: config.yOffset
  }))
)

let startTime = 0

const updateAnimations = (elapsed: number, _delta: number) => {
  // Core rotation
  coreState.rotationY = elapsed * 0.15
  
  // Update node positions
  skillNodes.value.forEach((node, index) => {
    const currentAngle = node.angle + elapsed * node.speed
    nodeStates[index].x = Math.cos(currentAngle) * node.orbitRadius
    nodeStates[index].z = Math.sin(currentAngle) * node.orbitRadius
  })
  
  // Orbit group rotation
  if (orbitGroupRef.value) {
    orbitGroupRef.value.rotation.y = elapsed * 0.02
  }
}

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="skills"]')
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
  <!-- Camera positioned for angled view -->
  <TresPerspectiveCamera :position="[4, 3, 5]" :look-at="[0, 0, 0]" />
  
  <!-- Lighting -->
  <TresAmbientLight :intensity="0.5" />
  <TresPointLight :position="[3, 4, 3]" :intensity="1.2" color="#FFFFFF" />
  <TresPointLight :position="[-3, 2, -3]" :intensity="0.5" color="#42B883" />
  
  <!-- Central core -->
  <TresGroup :rotation="[0, coreState.rotationY, 0]">
    <TresMesh>
      <TresIcosahedronGeometry :args="[0.35, 0]" />
      <TresMeshStandardMaterial
        color="#00FF41"
        emissive="#00FF41"
        :emissive-intensity="0.6"
        :roughness="0.3"
        :metalness="0.7"
      />
    </TresMesh>
    
    <!-- Core ring -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.55, 0.012, 8, 24]" />
      <TresMeshBasicMaterial color="#00FF41" :opacity="0.5" :transparent="true" />
    </TresMesh>
  </TresGroup>
  
  <!-- Skill nodes orbiting by category - tilted for 3D effect -->
  <TresGroup ref="orbitGroupRef" :rotation="[0.3, 0, 0.1]">
    <!-- Actual skill nodes -->
    <TresMesh 
      v-for="(node, index) in skillNodes" 
      :key="node.id"
      :position="[nodeStates[index].x, nodeStates[index].y, nodeStates[index].z]"
    >
      <TresBoxGeometry :args="[node.size, node.size, node.size]" />
      <TresMeshStandardMaterial
        :color="node.color"
        :emissive="node.color"
        :emissive-intensity="0.4"
        :roughness="0.4"
        :metalness="0.6"
      />
    </TresMesh>
    
    <!-- Orbit rings per category at different heights -->
    <TresMesh 
      v-for="ring in orbitRings" 
      :key="`orbit-${ring.id}`"
      :position="[0, ring.yOffset, 0]"
      :rotation="[-Math.PI / 2, 0, 0]"
    >
      <TresTorusGeometry :args="[ring.radius, 0.006, 4, 48]" />
      <TresMeshBasicMaterial :color="ring.color" :opacity="0.2" :transparent="true" />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial color="#0a0a12" :roughness="0.95" />
  </TresMesh>
</template>
