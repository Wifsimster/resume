<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const benchRef = ref()
const ringRef = ref()

// Tool positions on workbench
const tools = [
  { x: -1.5, y: 0.6, z: 0, type: 'digital', color: '#42B883' },
  { x: -0.8, y: 0.6, z: 0.3, type: 'digital', color: '#61DAFB' },
  { x: 0, y: 0.6, z: 0, type: 'highlight', color: '#00FF41' },
  { x: 0.8, y: 0.6, z: 0.3, type: 'physical', color: '#B87333' },
  { x: 1.5, y: 0.6, z: 0, type: 'physical', color: '#8B5A2B' },
]

// Reactive tool states for animations
const toolStates = reactive(
  tools.map((_, i) => ({
    y: 0.6,
    rotationY: 0,
    scale: 1,
    emissive: 0.2
  }))
)

// Leg positions typed as tuples
const legPositions: [number, number, number][] = [
  [-1.7, -0.7, 0.7],
  [1.7, -0.7, 0.7],
  [-1.7, -0.7, -0.7],
  [1.7, -0.7, -0.7]
]

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  
  // Animate bench with continuous rotation + gentle oscillation
  if (benchRef.value) {
    benchRef.value.rotation.y = elapsed * 0.08 + Math.sin(elapsed * 0.3) * 0.1
    benchRef.value.position.y = Math.sin(elapsed * 0.4) * 0.03
  }
  
  // Animate each tool individually
  tools.forEach((tool, index) => {
    const offset = index * 0.8
    // Floating effect
    toolStates[index].y = 0.6 + Math.sin(elapsed * 1.5 + offset) * 0.08
    // Rotation for digital tools
    if (tool.type === 'digital' || tool.type === 'highlight') {
      toolStates[index].rotationY = elapsed * 0.5 + offset
    }
    // Pulsing glow
    toolStates[index].emissive = tool.type === 'highlight' 
      ? 0.4 + Math.sin(elapsed * 2) * 0.3
      : 0.2 + Math.sin(elapsed * 1.5 + offset) * 0.15
    // Subtle scale pulse for highlight
    if (tool.type === 'highlight') {
      toolStates[index].scale = 1 + Math.sin(elapsed * 2) * 0.1
    }
  })
  
  // Animate skill indicator ring
  if (ringRef.value) {
    ringRef.value.rotation.z = elapsed * 0.5
    const ringScale = 1 + Math.sin(elapsed * 1.5) * 0.15
    ringRef.value.scale.set(ringScale, ringScale, ringScale)
  }
  
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  startTime = Date.now()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 3, 6]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 4, 3]" :intensity="1" color="#FFFFFF" />
  <TresPointLight :position="[-2, 2, 2]" :intensity="0.3" color="#42B883" />
  <TresPointLight :position="[2, 2, 2]" :intensity="0.3" color="#B87333" />
  
  <TresGroup ref="benchRef">
    <!-- Workbench surface -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[4, 0.3, 2]" />
      <TresMeshStandardMaterial
        :color="'#5D4037'"
        :roughness="0.9"
        :metalness="0.1"
      />
    </TresMesh>
    
    <!-- Bench legs -->
    <TresMesh v-for="(pos, i) in legPositions" :key="`leg-${i}`" :position="pos">
      <TresBoxGeometry :args="[0.15, 1.1, 0.15]" />
      <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.9" />
    </TresMesh>
    
    <!-- Tool pegboard backdrop -->
    <TresMesh :position="[0, 1.5, -1.2]">
      <TresBoxGeometry :args="[4.5, 2.5, 0.1]" />
      <TresMeshStandardMaterial
        :color="'#4E342E'"
        :roughness="0.95"
      />
    </TresMesh>
    
    <!-- Tools on bench with animations -->
    <TresGroup 
      v-for="(tool, index) in tools" 
      :key="`tool-${index}`" 
      :position="[tool.x, toolStates[index].y, tool.z]"
      :rotation="[0, toolStates[index].rotationY, 0]"
    >
      <!-- Digital tools = cubes with glow -->
      <TresMesh 
        v-if="tool.type === 'digital' || tool.type === 'highlight'"
        :scale="[toolStates[index].scale, toolStates[index].scale, toolStates[index].scale]"
      >
        <TresBoxGeometry :args="[0.3, 0.3, 0.3]" />
        <TresMeshStandardMaterial
          :color="tool.color"
          :emissive="tool.color"
          :emissive-intensity="toolStates[index].emissive"
          :roughness="0.3"
          :metalness="0.7"
        />
      </TresMesh>
      
      <!-- Physical tools = cylinders (like chisels) -->
      <TresMesh v-if="tool.type === 'physical'" :rotation="[Math.PI / 2, 0, 0]">
        <TresCylinderGeometry :args="[0.05, 0.08, 0.5, 8]" />
        <TresMeshStandardMaterial
          :color="tool.color"
          :emissive="tool.color"
          :emissive-intensity="toolStates[index].emissive"
          :roughness="0.7"
          :metalness="0.3"
        />
      </TresMesh>
      
      <!-- Glow halo for highlight tool -->
      <TresMesh v-if="tool.type === 'highlight'" :scale="[toolStates[index].scale * 1.5, toolStates[index].scale * 1.5, toolStates[index].scale * 1.5]">
        <TresSphereGeometry :args="[0.25, 16, 16]" />
        <TresMeshBasicMaterial :color="tool.color" :opacity="0.15" :transparent="true" />
      </TresMesh>
    </TresGroup>
    
    <!-- Skill level indicators (floating) -->
    <TresGroup ref="ringRef" :position="[0, 2.2, -1]">
      <!-- Pentagon ring -->
      <TresMesh>
        <TresRingGeometry :args="[0.3, 0.35, 5]" />
        <TresMeshStandardMaterial 
          :color="'#FFD93D'" 
          :emissive="'#FFD93D'"
          :emissive-intensity="0.5"
          :side="2" 
        />
      </TresMesh>
      <!-- Inner glow -->
      <TresMesh>
        <TresRingGeometry :args="[0.15, 0.25, 5]" />
        <TresMeshBasicMaterial :color="'#FFD93D'" :opacity="0.3" :transparent="true" :side="2" />
      </TresMesh>
      <!-- Outer accent ring -->
      <TresMesh>
        <TresRingGeometry :args="[0.4, 0.42, 5]" />
        <TresMeshBasicMaterial :color="'#FFD93D'" :opacity="0.2" :transparent="true" :side="2" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
  
  <!-- Floor -->
  <TresMesh :position="[0, -1.3, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[12, 12]" />
    <TresMeshStandardMaterial :color="'#1A1410'" :roughness="0.95" />
  </TresMesh>
</template>

