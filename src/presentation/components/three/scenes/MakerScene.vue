<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

const sceneRef = ref()

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
let animationId: number
let startTime = 0

const anim = reactive({
  time: 0,
  ledPhase: 0,
  serverLeds: [] as number[],
  fanRotation: 0,
  hddActivity: 0,
  screenFlicker: [1, 1, 1] as number[]
})

// Server rack configuration
const serverCount = computed(() => props.quality === 'high' ? 8 : 5)
const serverUnits = computed(() => 
  Array.from({ length: serverCount.value }, (_, i) => ({
    y: 2.8 - i * 0.55,
    ledCount: 4 + Math.floor(Math.random() * 3),
    hasHdd: i % 2 === 0,
    type: i === 0 ? 'network' : i === 1 ? 'storage' : 'compute'
  }))
)

// LED strip configuration
const ledCount = computed(() => props.quality === 'high' ? 30 : 18)

// Network cables
const networkCables = computed(() => props.quality === 'high' ? 6 : 3)

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
const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  anim.time = elapsed
  
  // LED rainbow flow
  anim.ledPhase = elapsed * 45
  
  // Server LEDs blinking pattern
  anim.serverLeds = serverUnits.value.map((_, i) => {
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
  
  animationId = requestAnimationFrame(animate)
}

// LED color with smooth gradient (unused but kept for potential future use)
const _getLedColor = (index: number) => {
  const hue = (index * (360 / ledCount.value) + anim.ledPhase) % 360
  return `hsl(${hue}, 100%, 55%)`
}
void _getLedColor // Suppress unused warning

// Server LED state
const getServerLedState = (serverIndex: number, ledIndex: number) => {
  const pattern = Math.sin(anim.time * (3 + ledIndex * 0.8) + serverIndex * 2 + ledIndex) > 0.3
  return pattern ? 1 : 0.15
}

// Dust particle animation
const getDustPos = (particle: typeof dustParticles.value[0]) => {
  return {
    x: particle.x + Math.sin(anim.time * particle.speed + particle.phase) * 0.4,
    y: particle.y + Math.sin(anim.time * particle.speed * 0.7 + particle.phase) * 0.25,
    z: particle.z
  }
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
  <TresPerspectiveCamera :position="[0.5, 2, 6]" :look-at="[0.5, 1, -0.3]" />
  
  <!-- Enhanced Lighting -->
  <TresAmbientLight :intensity="0.9" />
  <TresPointLight :position="[0, 6, 5]" :intensity="4" color="#FFFFFF" />
  <TresPointLight :position="[-4, 4, 3]" :intensity="2" :color="colors.screenGlow" />
  <TresPointLight :position="[4, 3, 3]" :intensity="2.5" :color="colors.serverBlue" />
  <TresPointLight :position="[3, 1, 2]" :intensity="1.5" :color="colors.serverGreen" />
  <TresPointLight :position="[0, 3, 2]" :intensity="1.5" :color="colors.wifi" />
  <TresPointLight :position="[-2, 1, 3]" :intensity="1.5" color="#FFFFFF" />
  <TresPointLight :position="[3, 4, -1]" :intensity="1.5" color="#FFFFFF" />
  <TresPointLight :position="[-3, 2, 0]" :intensity="1.2" color="#FFFFFF" />
  <TresPointLight :position="[0, 0.5, 2]" :intensity="1" color="#FFFFFF" />
  <TresDirectionalLight :position="[2, 10, 5]" :intensity="2" color="#FFFFFF" />
  <TresDirectionalLight :position="[-3, 8, 3]" :intensity="1.5" color="#FFFFFF" />
  
  <TresGroup ref="sceneRef">
    
    <!-- ========== LARGE DESK ========== -->
    <TresGroup :position="[-1, 0, 0.5]">
      <!-- Desktop surface -->
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[6, 0.1, 2.5]" />
        <TresMeshStandardMaterial 
          :color="colors.wood" 
          :roughness="0.75"
          :metalness="0.05"
        />
      </TresMesh>
      
      <!-- Desk legs -->
      <TresMesh v-for="(pos, i) in [[-2.8, -0.9, -1], [2.8, -0.9, -1], [-2.8, -0.9, 1], [2.8, -0.9, 1]] as const" :key="`leg-${i}`" :position="pos">
        <TresBoxGeometry :args="[0.1, 1.7, 0.1]" />
        <TresMeshStandardMaterial :color="colors.metal" :metalness="0.7" />
      </TresMesh>
      
      <!-- Desk edge trim -->
      <TresMesh :position="[0, 0, 1.3]">
        <TresBoxGeometry :args="[6, 0.1, 0.08]" />
        <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.7" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== THREE MONITORS ========== -->
    
    <!-- Left Monitor -->
    <TresGroup :position="[-3.2, 1.6, -0.8]" :rotation="[0, 0.25, 0]">
      <!-- Monitor stand -->
      <TresMesh :position="[0, -0.7, 0.2]">
        <TresCylinderGeometry :args="[0.12, 0.2, 0.12, 16]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :metalness="0.8" />
      </TresMesh>
      <TresMesh :position="[0, -0.4, 0.1]">
        <TresBoxGeometry :args="[0.06, 0.5, 0.06]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :metalness="0.8" />
      </TresMesh>
      
      <!-- Monitor frame -->
      <TresMesh>
        <TresBoxGeometry :args="[2.4, 1.5, 0.08]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :roughness="0.3" />
      </TresMesh>
      
      <!-- Screen -->
      <TresMesh :position="[0, 0, 0.045]">
        <TresPlaneGeometry :args="[2.2, 1.35]" />
        <TresMeshBasicMaterial 
          :color="'#0D1117'"
          :opacity="anim.screenFlicker[0]"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Terminal content -->
      <TresMesh v-for="line in 10" :key="`left-line-${line}`" :position="[-0.85, 0.55 - line * 0.11, 0.05]">
        <TresPlaneGeometry :args="[0.4 + Math.sin(line * 2.5) * 0.5, 0.035]" />
        <TresMeshBasicMaterial 
          :color="colors.serverGreen"
          :opacity="0.85"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Terminal prompt -->
      <TresMesh :position="[-0.9, -0.5, 0.05]">
        <TresPlaneGeometry :args="[0.08, 0.04]" />
        <TresMeshBasicMaterial 
          :color="colors.serverGreen"
          :opacity="0.5 + Math.sin(anim.time * 3) * 0.5"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- Center Monitor (Main - Larger) -->
    <TresGroup :position="[-1, 1.8, -1]">
      <!-- Monitor stand -->
      <TresMesh :position="[0, -0.85, 0.25]">
        <TresCylinderGeometry :args="[0.15, 0.28, 0.15, 16]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :metalness="0.8" />
      </TresMesh>
      <TresMesh :position="[0, -0.45, 0.12]">
        <TresBoxGeometry :args="[0.08, 0.65, 0.08]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :metalness="0.8" />
      </TresMesh>
      
      <!-- Monitor frame -->
      <TresMesh>
        <TresBoxGeometry :args="[3.2, 1.9, 0.1]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :roughness="0.25" />
      </TresMesh>
      
      <!-- Screen -->
      <TresMesh :position="[0, 0, 0.055]">
        <TresPlaneGeometry :args="[3, 1.75]" />
        <TresMeshBasicMaterial 
          :color="'#0D1117'"
          :opacity="anim.screenFlicker[1]"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Code content -->
      <TresMesh v-for="line in 14" :key="`center-line-${line}`" :position="[-1.2 + (line % 3) * 0.15, 0.7 - line * 0.1, 0.06]">
        <TresPlaneGeometry :args="[0.5 + Math.sin(line * 1.8) * 0.6, 0.04]" />
        <TresMeshBasicMaterial 
          :color="line % 4 === 0 ? colors.wifi : line % 4 === 1 ? colors.serverGreen : line % 4 === 2 ? '#E879F9' : '#F9A8D4'"
          :opacity="0.8"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Line numbers -->
      <TresMesh v-for="num in 14" :key="`num-${num}`" :position="[-1.35, 0.7 - num * 0.1, 0.06]">
        <TresPlaneGeometry :args="[0.08, 0.035]" />
        <TresMeshBasicMaterial 
          :color="'#6B7280'"
          :opacity="0.5"
          :transparent="true"
        />
      </TresMesh>
      
    </TresGroup>
    
    <!-- Right Monitor -->
    <TresGroup :position="[1.2, 1.6, -0.8]" :rotation="[0, -0.25, 0]">
      <!-- Monitor stand -->
      <TresMesh :position="[0, -0.7, 0.2]">
        <TresCylinderGeometry :args="[0.12, 0.2, 0.12, 16]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :metalness="0.8" />
      </TresMesh>
      <TresMesh :position="[0, -0.4, 0.1]">
        <TresBoxGeometry :args="[0.06, 0.5, 0.06]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :metalness="0.8" />
      </TresMesh>
      
      <!-- Monitor frame -->
      <TresMesh>
        <TresBoxGeometry :args="[2.4, 1.5, 0.08]" />
        <TresMeshStandardMaterial :color="colors.darkMetal" :roughness="0.3" />
      </TresMesh>
      
      <!-- Screen -->
      <TresMesh :position="[0, 0, 0.045]">
        <TresPlaneGeometry :args="[2.2, 1.35]" />
        <TresMeshBasicMaterial 
          :color="'#0D1117'"
          :opacity="anim.screenFlicker[2]"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Monitoring dashboard - graphs -->
      <TresMesh v-for="graph in 4" :key="`graph-${graph}`" :position="[-0.5 + (graph % 2) * 1, 0.35 - Math.floor(graph / 2) * 0.7, 0.05]">
        <TresPlaneGeometry :args="[0.9, 0.55]" />
        <TresMeshBasicMaterial 
          :color="'#1E293B'"
          :opacity="0.9"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Graph lines -->
      <TresMesh v-for="line in 8" :key="`graph-line-${line}`" :position="[-0.5 + (line % 2) * 1, 0.2 + Math.sin(anim.time * 2 + line) * 0.15 - Math.floor(line / 2) * 0.35, 0.055]">
        <TresPlaneGeometry :args="[0.7, 0.03]" />
        <TresMeshBasicMaterial 
          :color="line < 4 ? colors.serverGreen : colors.led"
          :opacity="0.9"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- CPU/RAM indicators -->
      <TresMesh v-for="ind in 4" :key="`ind-${ind}`" :position="[-0.85 + ind * 0.25, -0.55, 0.05]">
        <TresPlaneGeometry :args="[0.15, 0.08]" />
        <TresMeshBasicMaterial 
          :color="ind < 3 ? colors.serverGreen : colors.led"
          :opacity="0.7 + Math.sin(anim.time * (2 + ind)) * 0.3"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== 75% MECHANICAL KEYBOARD (White/Blue theme) ========== -->
    <TresGroup :position="[-1, 0.08, 0.8]">
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
        <TresMesh v-for="line in 12" :key="`knob-${line}`" :position="[Math.cos(line * Math.PI / 6) * 0.048, 0.025, Math.sin(line * Math.PI / 6) * 0.048]">
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
      
      <!-- USB Cable -->
      <TresMesh :position="[0, 0, -0.35]">
        <TresCylinderGeometry :args="[0.02, 0.02, 0.25, 8]" />
        <TresMeshStandardMaterial :color="'#E0E0E0'" :roughness="0.5" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== SIMPLE WIRELESS MOUSE ========== -->
    <TresGroup :position="[0.8, 0.05, 0.85]">
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
    
    <!-- ========== MOUSEPAD ========== -->
    <TresGroup :position="[0.8, 0.02, 0.85]">
      <TresMesh>
        <TresBoxGeometry :args="[0.9, 0.008, 0.65]" />
        <TresMeshStandardMaterial :color="'#2A2A2A'" :roughness="0.85" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== COFFEE MUG ========== -->
    <TresGroup :position="[1.8, 0.22, 0.5]">
      <TresMesh>
        <TresCylinderGeometry :args="[0.1, 0.08, 0.25, 16]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.5" />
      </TresMesh>
      <TresMesh :position="[0.12, 0, 0]" :rotation="[0, 0, Math.PI / 2]">
        <TresTorusGeometry :args="[0.06, 0.018, 8, 12, Math.PI]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.5" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== SERVER RACK ========== -->
    <TresGroup :position="[3, 0, -0.5]">
      
      <!-- Rack frame -->
      <TresMesh :position="[0, 1.2, 0]">
        <TresBoxGeometry :args="[1.8, 4, 1.2]" />
        <TresMeshStandardMaterial 
          :color="'#212121'" 
          :roughness="0.4"
          :metalness="0.7"
        />
      </TresMesh>
      
      <!-- Rack front panel -->
      <TresMesh :position="[0, 1.2, 0.62]">
        <TresBoxGeometry :args="[1.7, 3.9, 0.02]" />
        <TresMeshStandardMaterial 
          :color="'#1A1A1A'" 
          :roughness="0.3"
          :metalness="0.8"
        />
      </TresMesh>
      
      <!-- Ventilation holes pattern -->
      <TresMesh 
        v-for="(_row, ri) in 12" 
        :key="`vent-row-${ri}`"
        :position="[-0.5, -0.4 + ri * 0.28, 0.64]"
      >
        <TresPlaneGeometry :args="[0.3, 0.08]" />
        <TresMeshBasicMaterial :color="'#0A0A0A'" />
      </TresMesh>
      
      <!-- Server units -->
      <TresGroup 
        v-for="(server, si) in serverUnits" 
        :key="`server-${si}`"
        :position="[0, server.y, 0.4]"
      >
        <!-- Server chassis -->
        <TresMesh>
          <TresBoxGeometry :args="[1.5, 0.4, 0.7]" />
          <TresMeshStandardMaterial 
            :color="si === 0 ? '#1565C0' : si === 1 ? '#2E7D32' : '#37474F'" 
            :roughness="0.35"
            :metalness="0.6"
          />
        </TresMesh>
        
        <!-- Server front plate -->
        <TresMesh :position="[0, 0, 0.36]">
          <TresBoxGeometry :args="[1.45, 0.35, 0.02]" />
          <TresMeshStandardMaterial 
            :color="'#1A1A1A'" 
            :roughness="0.25"
            :metalness="0.8"
          />
        </TresMesh>
        
        <!-- Status LEDs -->
        <TresMesh 
          v-for="led in server.ledCount" 
          :key="`server-led-${si}-${led}`"
          :position="[-0.55 + led * 0.12, 0.08, 0.38]"
        >
          <TresSphereGeometry :args="[0.025, 6, 6]" />
          <TresMeshBasicMaterial 
            :color="led === 1 ? colors.serverGreen : led === 2 ? colors.wifi : led % 2 === 0 ? colors.serverGreen : colors.serverRed"
            :opacity="getServerLedState(si, led)"
            :transparent="true"
          />
        </TresMesh>
        
        <!-- Power button -->
        <TresMesh :position="[0.6, 0.08, 0.38]">
          <TresCircleGeometry :args="[0.03, 12]" />
          <TresMeshBasicMaterial 
            :color="colors.serverGreen"
            :opacity="0.9"
            :transparent="true"
          />
        </TresMesh>
        
        <!-- HDD activity LED -->
        <TresMesh v-if="server.hasHdd" :position="[0.5, 0.08, 0.38]">
          <TresSphereGeometry :args="[0.02, 6, 6]" />
          <TresMeshBasicMaterial 
            :color="colors.led"
            :opacity="anim.hddActivity"
            :transparent="true"
          />
        </TresMesh>
        
        <!-- Drive bays -->
        <TresMesh 
          v-for="bay in 3" 
          :key="`bay-${si}-${bay}`"
          :position="[-0.4 + bay * 0.25, -0.08, 0.37]"
        >
          <TresBoxGeometry :args="[0.18, 0.12, 0.02]" />
          <TresMeshStandardMaterial :color="'#2D2D2D'" :metalness="0.5" />
        </TresMesh>
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
        <TresGroup 
          v-for="fan in 2" 
          :key="`top-fan-${fan}`"
          :position="[-0.4 + fan * 0.8, 0.16, 0]"
          :rotation="[-Math.PI / 2, 0, anim.fanRotation * (fan % 2 === 0 ? 1 : -1)]"
        >
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
      
      <!-- Network cables -->
      <TresGroup :position="[-1, 1.5, 0.2]">
        <TresMesh 
          v-for="cable in networkCables" 
          :key="`cable-${cable}`"
          :position="[0, -0.8 + cable * 0.5, 0]"
        >
          <TresCylinderGeometry :args="[0.02, 0.02, 0.8, 6]" />
          <TresMeshStandardMaterial 
            :color="cable % 3 === 0 ? '#2196F3' : cable % 3 === 1 ? '#FF9800' : '#4CAF50'" 
            :roughness="0.6"
          />
        </TresMesh>
      </TresGroup>
      
      <!-- Cable management panel -->
      <TresMesh :position="[-1.05, 1.2, 0]">
        <TresBoxGeometry :args="[0.08, 3.5, 0.9]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.4" />
      </TresMesh>
      
      <!-- Rear network ports glow -->
      <TresGroup :position="[0, 2.6, -0.65]">
        <TresMesh 
          v-for="port in 4" 
          :key="`net-port-${port}`"
          :position="[-0.4 + port * 0.25, 0, 0]"
        >
          <TresSphereGeometry :args="[0.03, 6, 6]" />
          <TresMeshBasicMaterial 
            :color="port % 2 === 0 ? colors.serverGreen : colors.led"
            :opacity="Math.sin(anim.time * (5 + port) + port * 2) > 0.3 ? 1 : 0.2"
            :transparent="true"
          />
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
          <TresMeshBasicMaterial 
            :color="bat < 4 ? colors.serverGreen : colors.led"
            :opacity="bat < 4 ? 0.9 : 0.3"
            :transparent="true"
          />
        </TresMesh>
      </TresGroup>
      
    </TresGroup>
    
    <!-- ========== ATMOSPHERE DUST ========== -->
    <TresMesh 
      v-for="(dust, i) in dustParticles" 
      :key="`dust-${i}`"
      :position="[getDustPos(dust).x, getDustPos(dust).y, getDustPos(dust).z]"
    >
      <TresSphereGeometry :args="[0.01, 4, 4]" />
      <TresMeshBasicMaterial 
        :color="'#FFFFFF'"
        :opacity="0.1"
        :transparent="true"
      />
    </TresMesh>
    
    <!-- ========== BACKDROP WALL ========== -->
    <TresMesh :position="[1, 2, -2.5]">
      <TresPlaneGeometry :args="[16, 7]" />
      <TresMeshStandardMaterial 
        :color="'#0A0A0A'" 
        :roughness="0.9"
        :emissive="colors.serverBlue"
        :emissive-intensity="0.015"
      />
    </TresMesh>
    
  </TresGroup>
  
  <!-- ========== FLOOR ========== -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[20, 16]" />
    <TresMeshStandardMaterial 
      :color="'#080808'" 
      :roughness="0.75"
      :emissive="colors.metal"
      :emissive-intensity="0.01"
    />
  </TresMesh>
</template>
