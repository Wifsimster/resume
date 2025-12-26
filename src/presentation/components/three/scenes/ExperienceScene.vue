<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

defineProps<{
  quality: QualityLevel
}>()

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller
const animationController = useAnimationController(sectionElement)

// Theme colors matching the section (Cursor IDE purple theme)
const themeColors = {
  primary: '#A855F7',    // Terminal green (which is purple in this theme)
  secondary: '#7C3AED',  // Accent primary - deeper purple
  tertiary: '#6366F1',   // Indigo
  accent: '#FBBF24',     // Achievement gold for highlights
  dark: '#0F0A1A'        // Background purple tint
}

// Server rack animation
const rackRef = ref()

let startTime = 0

// Reactive LED states for blinking
const ledStates = reactive<{ intensity: number }[]>(
  Array.from({ length: 20 }, () => ({ intensity: 1 }))
)

const updateAnimations = (elapsed: number, _delta: number) => {
  // Animate rack with gentle continuous rotation + oscillation
  if (rackRef.value) {
    rackRef.value.rotation.y = elapsed * 0.1 + Math.sin(elapsed * 0.5) * 0.15
    rackRef.value.position.y = Math.sin(elapsed * 0.3) * 0.05
  }
  
  // Update LED blinking states
  ledPositions.forEach((led, index) => {
    const blinkSpeed = 2 + (index % 3) * 1.5
    const blinkValue = Math.sin(elapsed * blinkSpeed + led.blinkOffset)
    ledStates[index].intensity = 0.5 + blinkValue * 0.5
  })
}

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="experience"]')
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

// Generate LED positions for server rack
const ledPositions = Array.from({ length: 20 }, (_, i) => ({
  x: -1 + (i % 5) * 0.5,
  y: 1.5 - Math.floor(i / 5) * 0.8,
  z: 0.55,
  blinkOffset: Math.random() * Math.PI * 2
}))

// LED colors based on theme - purple/violet palette
const getLedColor = (index: number) => {
  const colors = [themeColors.primary, themeColors.secondary, themeColors.tertiary]
  return colors[index % 3]
}
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />
  
  <!-- Lighting with purple theme -->
  <TresAmbientLight :intensity="0.2" />
  <TresPointLight :position="[0, 3, 5]" :intensity="0.8" color="#FFFFFF" />
  <TresPointLight :position="[-3, 0, 3]" :intensity="0.5" :color="themeColors.primary" />
  <TresPointLight :position="[3, 0, 3]" :intensity="0.5" :color="themeColors.secondary" />
  <TresPointLight :position="[0, -2, 4]" :intensity="0.3" :color="themeColors.tertiary" />
  
  <!-- Server Rack -->
  <TresGroup ref="rackRef" :position="[0, 0, 0]">
    <!-- Rack frame with purple tint -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[3, 4, 1]" />
      <TresMeshStandardMaterial
        :color="themeColors.dark"
        :emissive="themeColors.secondary"
        :emissive-intensity="0.05"
        :roughness="0.9"
        :metalness="0.3"
      />
    </TresMesh>
    
    <!-- Rack units (servers) with purple accent -->
    <TresMesh 
      v-for="i in 4" 
      :key="`server-${i}`"
      :position="[0, 1.5 - (i - 1) * 0.9, 0.3]"
    >
      <TresBoxGeometry :args="[2.6, 0.7, 0.5]" />
      <TresMeshStandardMaterial
        :color="'#1A1525'"
        :emissive="themeColors.primary"
        :emissive-intensity="0.03"
        :roughness="0.7"
        :metalness="0.5"
      />
    </TresMesh>
    
    <!-- Server edge glow lines -->
    <TresMesh 
      v-for="i in 4" 
      :key="`glow-${i}`"
      :position="[0, 1.5 - (i - 1) * 0.9, 0.56]"
    >
      <TresBoxGeometry :args="[2.55, 0.02, 0.01]" />
      <TresMeshBasicMaterial
        :color="themeColors.primary"
        :opacity="0.6"
        :transparent="true"
      />
    </TresMesh>
    
    <!-- LEDs with blinking animation -->
    <TresMesh
      v-for="(led, index) in ledPositions"
      :key="`led-${index}`"
      :position="[led.x, led.y, led.z]"
    >
      <TresSphereGeometry :args="[0.05, 8, 8]" />
      <TresMeshStandardMaterial
        :color="getLedColor(index)"
        :emissive="getLedColor(index)"
        :emissive-intensity="ledStates[index].intensity"
      />
    </TresMesh>
    
    <!-- Ventilation grilles -->
    <TresMesh :position="[0, -1.6, 0.51]">
      <TresPlaneGeometry :args="[2.5, 0.4]" />
      <TresMeshBasicMaterial :color="'#080810'" />
    </TresMesh>
    
    <!-- Decorative wireframe cube - tech aesthetic -->
    <TresMesh :position="[0, 0, 0]" :scale="[3.2, 4.2, 1.2]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial
        :color="themeColors.primary"
        :wireframe="true"
        :opacity="0.15"
        :transparent="true"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Floor reflection with purple tint -->
  <TresMesh :position="[0, -2.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial
      :color="themeColors.dark"
      :emissive="themeColors.secondary"
      :emissive-intensity="0.02"
      :roughness="0.3"
      :metalness="0.8"
    />
  </TresMesh>
  
  <!-- Ambient particles / star field background -->
  <TresMesh 
    v-for="i in 20" 
    :key="`star-${i}`"
    :position="[
      (Math.sin(i * 1.7) * 8),
      (Math.cos(i * 2.3) * 5),
      -3 - (i % 5)
    ]"
  >
    <TresSphereGeometry :args="[0.03, 4, 4]" />
    <TresMeshBasicMaterial 
      :color="themeColors.primary" 
      :opacity="0.4" 
      :transparent="true" 
    />
  </TresMesh>
</template>

