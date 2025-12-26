<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

const sceneRef = ref()
const houseRef = ref()

// Theme colors
const colors = {
  electronics: '#00979D',
  led: '#FF6B35',
  wood: '#8B5A2B',
  copper: '#B87333',
  wifi: '#03A9F4',
  home: '#4CAF50',
  power: '#FFD700',
  spark: '#FF5722',
  raspberry: '#C51A4A'
}

// Animation state
let animationId: number
let startTime = 0

const anim = reactive({
  time: 0,
  ledPhase: 0,
  circuitFlow: 0,
  wifiPulse: 0,
  sparkIntensity: 0,
  gpioFlicker: [0, 0, 0, 0, 0] as number[],
  houseGlow: [0, 0, 0, 0] as number[]
})

// LED strip - more LEDs, tighter spacing
const ledCount = computed(() => props.quality === 'high' ? 24 : 14)
const ledStrip = computed(() => 
  Array.from({ length: ledCount.value }, (_, i) => ({
    x: -4 + i * (8 / (ledCount.value - 1)),
    y: 3.2,
    z: -2.5,
    index: i
  }))
)

// More circuit nodes for better flow effect
const circuitNodes = [
  { x: -2, y: 0.4, z: 0.3 },
  { x: -1.5, y: 0.4, z: 0.6 },
  { x: -1, y: 0.4, z: 0.3 },
  { x: -0.5, y: 0.4, z: 0.7 },
  { x: 0, y: 0.4, z: 0.4 },
  { x: 0.5, y: 0.4, z: 0.6 },
  { x: 1, y: 0.4, z: 0.3 },
  { x: 1.5, y: 0.4, z: 0.5 },
  { x: 2, y: 0.4, z: 0.3 }
]

// Raspberry Pi GPIO pins
const gpioPins = computed(() => props.quality === 'high' ? 5 : 3)

// WiFi signal rings
const wifiRings = computed(() => props.quality === 'high' ? 5 : 3)

// Spark particles - more sparks for better effect
const sparks = computed(() => {
  const count = props.quality === 'high' ? 30 : 12
  return Array.from({ length: count }, () => ({
    x: -0.4 + Math.random() * 0.8,
    y: 0.3 + Math.random() * 0.6,
    z: -0.3 + Math.random() * 0.6,
    speed: 0.8 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    size: 0.01 + Math.random() * 0.02
  }))
})

// House windows
const houseWindows = [
  { x: -0.2, y: 0.12, z: 0.41 },
  { x: 0.2, y: 0.12, z: 0.41 },
  { x: -0.2, y: -0.15, z: 0.41 },
  { x: 0.2, y: -0.15, z: 0.41 }
]

// Atmosphere particles
const dustParticles = computed(() => {
  if (props.quality !== 'high') return []
  return Array.from({ length: 40 }, () => ({
    x: -5 + Math.random() * 10,
    y: -1 + Math.random() * 5,
    z: -3 + Math.random() * 6,
    speed: 0.1 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2
  }))
})

// Floating electronic components
const floatingComponents = [
  { type: 'resistor', x: -3, y: 2, z: 0.5 },
  { type: 'capacitor', x: 3.2, y: 1.8, z: 0.8 },
  { type: 'chip', x: -2.5, y: 2.5, z: 1 }
]

// Animation loop
const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  anim.time = elapsed
  
  // LED rainbow flow - smoother
  anim.ledPhase = elapsed * 60
  
  // Circuit electricity flow - faster, smoother
  anim.circuitFlow = (elapsed * 3) % (circuitNodes.length + 3)
  
  // WiFi pulse
  anim.wifiPulse = elapsed * 2
  
  // Spark flickering - more dynamic
  anim.sparkIntensity = 0.6 + Math.sin(elapsed * 18) * 0.25 + Math.sin(elapsed * 31) * 0.15
  
  // GPIO random flickering
  anim.gpioFlicker = Array.from({ length: 5 }, (_, i) => 
    Math.sin(elapsed * (5 + i * 2) + i) > 0.3 ? 1 : 0.2
  )
  
  // House window lighting sequence - smoother transition
  const windowCycle = (elapsed * 0.6) % 5
  anim.houseGlow = houseWindows.map((_, i) => {
    if (windowCycle > 4) return 0.95
    const dist = Math.abs(i - windowCycle)
    return Math.max(0.1, 1 - dist * 0.3)
  })
  
  // Scene rotation - subtle
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.06) * 0.12
    sceneRef.value.position.y = Math.sin(elapsed * 0.15) * 0.05
  }
  
  // House floating
  if (houseRef.value) {
    houseRef.value.position.y = 1 + Math.sin(elapsed * 0.4) * 0.08
    houseRef.value.rotation.y = Math.sin(elapsed * 0.2) * 0.1
  }
  
  animationId = requestAnimationFrame(animate)
}

// LED color with smooth gradient
const getLedColor = (index: number) => {
  const hue = (index * (360 / ledCount.value) + anim.ledPhase) % 360
  return `hsl(${hue}, 100%, 60%)`
}

// Circuit glow with smoother falloff
const getCircuitGlow = (index: number) => {
  const dist = Math.abs(index - anim.circuitFlow)
  return Math.max(0, 1 - dist * 0.3) ** 1.5
}

// Spark animation helpers
const getSparkY = (spark: typeof sparks.value[0]) => {
  const cycle = (anim.time * spark.speed + spark.phase) % 1.5
  return spark.y + cycle * 1.2
}

const getSparkOpacity = (spark: typeof sparks.value[0]) => {
  const cycle = (anim.time * spark.speed + spark.phase) % 1.5
  return Math.max(0, 1 - cycle * 0.8) * anim.sparkIntensity
}

// Floating component animation
const getFloatY = (baseY: number, index: number) => {
  return baseY + Math.sin(anim.time * (0.5 + index * 0.15) + index * 2) * 0.25
}

const getFloatRot = (index: number) => {
  return Math.sin(anim.time * 0.3 + index) * 0.2
}

// Dust particle animation
const getDustPos = (particle: typeof dustParticles.value[0]) => {
  return {
    x: particle.x + Math.sin(anim.time * particle.speed + particle.phase) * 0.5,
    y: particle.y + Math.sin(anim.time * particle.speed * 0.7 + particle.phase) * 0.3,
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
  <TresPerspectiveCamera :position="[0, 1.5, 7]" :look-at="[0, 0.8, 0]" />
  
  <!-- Enhanced Lighting -->
  <TresAmbientLight :intensity="0.35" />
  <TresPointLight :position="[0, 6, 5]" :intensity="1.8" color="#FFFFFF" />
  <TresPointLight :position="[-5, 3, 2]" :intensity="0.7" :color="colors.electronics" />
  <TresPointLight :position="[5, 3, 2]" :intensity="0.7" :color="colors.wood" />
  <TresPointLight :position="[0, 2, 4]" :intensity="0.5" :color="colors.led" />
  <TresPointLight :position="[-2, 1, 2]" :intensity="0.4" :color="colors.raspberry" />
  <TresPointLight :position="[2.5, 2, 1]" :intensity="0.4" :color="colors.home" />
  
  <TresGroup ref="sceneRef">
    
    <!-- ========== WORKBENCH ========== -->
    <TresGroup :position="[0, -0.3, 0]">
      <TresMesh>
        <TresBoxGeometry :args="[7, 0.18, 4]" />
        <TresMeshStandardMaterial 
          :color="colors.wood" 
          :roughness="0.8"
          :metalness="0.05"
        />
      </TresMesh>
      <!-- Bench edge accent -->
      <TresMesh :position="[0, 0, 2.05]">
        <TresBoxGeometry :args="[7, 0.18, 0.1]" />
        <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.7" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== RASPBERRY PI ========== -->
    <TresGroup :position="[-2.2, -0.1, 0.5]">
      <!-- PCB -->
      <TresMesh>
        <TresBoxGeometry :args="[0.9, 0.06, 0.6]" />
        <TresMeshStandardMaterial 
          :color="'#2E7D32'" 
          :roughness="0.6"
          :emissive="colors.raspberry"
          :emissive-intensity="0.08"
        />
      </TresMesh>
      <!-- GPIO header -->
      <TresMesh :position="[0.3, 0.05, 0]">
        <TresBoxGeometry :args="[0.25, 0.08, 0.08]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" />
      </TresMesh>
      <!-- GPIO LEDs -->
      <TresMesh 
        v-for="pin in gpioPins" 
        :key="`gpio-${pin}`"
        :position="[0.15 + pin * 0.06, 0.1, 0]"
      >
        <TresSphereGeometry :args="[0.02, 6, 6]" />
        <TresMeshBasicMaterial 
          :color="pin % 2 === 0 ? colors.home : colors.raspberry"
          :opacity="anim.gpioFlicker[pin - 1]"
          :transparent="true"
        />
      </TresMesh>
      <!-- USB ports -->
      <TresMesh :position="[-0.35, 0.04, 0.15]">
        <TresBoxGeometry :args="[0.1, 0.06, 0.15]" />
        <TresMeshStandardMaterial :color="'#90A4AE'" :metalness="0.8" />
      </TresMesh>
      <!-- Power LED -->
      <TresMesh :position="[-0.3, 0.05, -0.2]">
        <TresSphereGeometry :args="[0.025, 8, 8]" />
        <TresMeshBasicMaterial 
          :color="colors.raspberry"
          :opacity="0.7 + Math.sin(anim.time * 2) * 0.3"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== CIRCUIT BOARD WITH FLOWING ELECTRICITY ========== -->
    <TresGroup :position="[0, -0.1, 0.2]">
      <!-- PCB Base -->
      <TresMesh>
        <TresBoxGeometry :args="[2.8, 0.07, 1.4]" />
        <TresMeshStandardMaterial 
          :color="'#1B5E20'" 
          :roughness="0.5"
          :emissive="colors.electronics"
          :emissive-intensity="0.06"
        />
      </TresMesh>
      
      <!-- Circuit trace pads -->
      <TresMesh 
        v-for="(node, i) in circuitNodes" 
        :key="`trace-${i}`"
        :position="[node.x, 0.05, node.z - 0.35]"
      >
        <TresBoxGeometry :args="[0.12, 0.025, 0.12]" />
        <TresMeshStandardMaterial 
          :color="colors.copper"
          :emissive="colors.power"
          :emissive-intensity="getCircuitGlow(i) * 2"
          :metalness="0.85"
          :roughness="0.25"
        />
      </TresMesh>
      
      <!-- Electricity glow orbs -->
      <TresMesh 
        v-for="(node, i) in circuitNodes" 
        :key="`glow-${i}`"
        :position="[node.x, 0.12, node.z - 0.35]"
      >
        <TresSphereGeometry :args="[0.1, 8, 8]" />
        <TresMeshBasicMaterial 
          :color="colors.power"
          :opacity="getCircuitGlow(i) * 0.8"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Trace lines -->
      <TresMesh 
        v-for="i in circuitNodes.length - 1" 
        :key="`conn-${i}`"
        :position="[(circuitNodes[i-1].x + circuitNodes[i].x) / 2, 0.045, (circuitNodes[i-1].z + circuitNodes[i].z) / 2 - 0.35]"
      >
        <TresBoxGeometry :args="[0.45, 0.018, 0.035]" />
        <TresMeshStandardMaterial 
          :color="colors.copper"
          :emissive="colors.power"
          :emissive-intensity="getCircuitGlow(i - 0.5)"
          :metalness="0.75"
        />
      </TresMesh>
      
      <!-- ESP8266 Module -->
      <TresGroup :position="[0.8, 0.06, 0]">
        <TresMesh>
          <TresBoxGeometry :args="[0.55, 0.05, 0.35]" />
          <TresMeshStandardMaterial :color="'#0D47A1'" :roughness="0.45" />
        </TresMesh>
        <TresMesh :position="[0.22, 0.035, 0]">
          <TresBoxGeometry :args="[0.1, 0.025, 0.18]" />
          <TresMeshStandardMaterial :color="'#37474F'" :metalness="0.7" />
        </TresMesh>
        <TresMesh :position="[-0.18, 0.04, 0.1]">
          <TresSphereGeometry :args="[0.025, 8, 8]" />
          <TresMeshBasicMaterial 
            :color="colors.wifi"
            :opacity="0.5 + Math.sin(anim.time * 4) * 0.5"
            :transparent="true"
          />
        </TresMesh>
      </TresGroup>
      
      <!-- SMD Components -->
      <TresMesh v-for="i in 4" :key="`smd-${i}`" :position="[-0.8 + i * 0.35, 0.06, -0.4]">
        <TresBoxGeometry :args="[0.08, 0.03, 0.04]" />
        <TresMeshStandardMaterial :color="'#212121'" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== SOLDERING STATION ========== -->
    <TresGroup :position="[-0.8, -0.1, -0.8]">
      <!-- Holder -->
      <TresMesh>
        <TresBoxGeometry :args="[0.5, 0.25, 0.35]" />
        <TresMeshStandardMaterial :color="'#37474F'" :metalness="0.6" />
      </TresMesh>
      
      <!-- Iron -->
      <TresGroup :position="[0.35, 0.2, 0]" :rotation="[0, 0, 0.25]">
        <TresMesh>
          <TresCylinderGeometry :args="[0.028, 0.038, 0.7, 8]" />
          <TresMeshStandardMaterial :color="'#FF8F00'" />
        </TresMesh>
        <TresMesh :position="[0, 0.4, 0]">
          <TresConeGeometry :args="[0.018, 0.18, 8]" />
          <TresMeshStandardMaterial 
            :color="colors.spark"
            :emissive="colors.spark"
            :emissive-intensity="anim.sparkIntensity * 1.5"
          />
        </TresMesh>
        <!-- Tip glow -->
        <TresMesh :position="[0, 0.5, 0]">
          <TresSphereGeometry :args="[0.06, 8, 8]" />
          <TresMeshBasicMaterial 
            :color="colors.spark"
            :opacity="anim.sparkIntensity * 0.6"
            :transparent="true"
          />
        </TresMesh>
      </TresGroup>
      
      <!-- Sparks -->
      <TresMesh 
        v-for="(spark, i) in sparks" 
        :key="`spark-${i}`"
        :position="[spark.x + 0.35, getSparkY(spark), spark.z]"
      >
        <TresSphereGeometry :args="[spark.size, 4, 4]" />
        <TresMeshBasicMaterial 
          :color="i % 3 === 0 ? colors.spark : colors.power"
          :opacity="getSparkOpacity(spark)"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== SMART HOME MODEL ========== -->
    <TresGroup ref="houseRef" :position="[2.3, 1, -0.5]">
      <!-- House body -->
      <TresMesh>
        <TresBoxGeometry :args="[0.85, 0.65, 0.8]" />
        <TresMeshStandardMaterial 
          :color="'#E8E8E8'" 
          :roughness="0.75"
        />
      </TresMesh>
      
      <!-- Roof -->
      <TresMesh :position="[0, 0.45, 0]" :rotation="[0, Math.PI / 4, 0]">
        <TresConeGeometry :args="[0.72, 0.42, 4]" />
        <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.85" />
      </TresMesh>
      
      <!-- Windows -->
      <TresMesh 
        v-for="(win, i) in houseWindows" 
        :key="`win-${i}`"
        :position="[win.x, win.y, win.z]"
      >
        <TresPlaneGeometry :args="[0.18, 0.18]" />
        <TresMeshBasicMaterial 
          :color="colors.home"
          :opacity="anim.houseGlow[i]"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Window glow -->
      <TresMesh 
        v-for="(win, i) in houseWindows" 
        :key="`win-glow-${i}`"
        :position="[win.x, win.y, win.z + 0.08]"
      >
        <TresPlaneGeometry :args="[0.32, 0.32]" />
        <TresMeshBasicMaterial 
          :color="colors.home"
          :opacity="anim.houseGlow[i] * 0.35"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- WiFi antenna -->
      <TresMesh :position="[0.28, 0.75, 0.25]">
        <TresCylinderGeometry :args="[0.015, 0.015, 0.25, 6]" />
        <TresMeshStandardMaterial :color="'#78909C'" :metalness="0.85" />
      </TresMesh>
      
      <!-- WiFi rings -->
      <TresMesh 
        v-for="ring in wifiRings" 
        :key="`wifi-${ring}`"
        :position="[0.28, 0.9, 0.25]"
        :rotation="[Math.PI / 2, 0, 0]"
        :scale="[1 + ((anim.wifiPulse + ring * 0.25) % 1.8) * 0.7, 1 + ((anim.wifiPulse + ring * 0.25) % 1.8) * 0.7, 1]"
      >
        <TresRingGeometry :args="[0.08, 0.11, 16]" />
        <TresMeshBasicMaterial 
          :color="colors.wifi"
          :opacity="Math.max(0, 0.9 - ((anim.wifiPulse + ring * 0.25) % 1.8) * 0.5)"
          :transparent="true"
          :side="2"
        />
      </TresMesh>
      
      <!-- Door -->
      <TresMesh :position="[0, -0.2, 0.41]">
        <TresPlaneGeometry :args="[0.2, 0.28]" />
        <TresMeshStandardMaterial :color="'#5D4037'" :roughness="0.75" />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== FLOATING COMPONENTS ========== -->
    <TresGroup>
      <!-- Resistor -->
      <TresGroup 
        :position="[floatingComponents[0].x, getFloatY(floatingComponents[0].y, 0), floatingComponents[0].z]"
        :rotation="[getFloatRot(0), anim.time * 0.2, getFloatRot(0) * 0.5]"
      >
        <TresMesh>
          <TresCylinderGeometry :args="[0.04, 0.04, 0.25, 8]" />
          <TresMeshStandardMaterial :color="'#8D6E63'" />
        </TresMesh>
        <TresMesh :position="[0, 0, 0]">
          <TresTorusGeometry :args="[0.045, 0.01, 8, 16]" />
          <TresMeshStandardMaterial :color="'#F44336'" />
        </TresMesh>
        <TresMesh :position="[0, 0.03, 0]">
          <TresTorusGeometry :args="[0.045, 0.01, 8, 16]" />
          <TresMeshStandardMaterial :color="'#9C27B0'" />
        </TresMesh>
      </TresGroup>
      
      <!-- Capacitor -->
      <TresGroup 
        :position="[floatingComponents[1].x, getFloatY(floatingComponents[1].y, 1), floatingComponents[1].z]"
        :rotation="[getFloatRot(1), 0, getFloatRot(1)]"
      >
        <TresMesh>
          <TresCylinderGeometry :args="[0.06, 0.06, 0.18, 12]" />
          <TresMeshStandardMaterial :color="'#1A237E'" :roughness="0.4" />
        </TresMesh>
        <TresMesh :position="[0, 0.1, 0]">
          <TresCircleGeometry :args="[0.06, 12]" />
          <TresMeshStandardMaterial :color="'#90A4AE'" :metalness="0.9" />
        </TresMesh>
      </TresGroup>
      
      <!-- IC Chip -->
      <TresGroup 
        :position="[floatingComponents[2].x, getFloatY(floatingComponents[2].y, 2), floatingComponents[2].z]"
        :rotation="[0, anim.time * 0.15, getFloatRot(2)]"
      >
        <TresMesh>
          <TresBoxGeometry :args="[0.22, 0.05, 0.12]" />
          <TresMeshStandardMaterial :color="'#212121'" />
        </TresMesh>
        <!-- Pins -->
        <TresMesh v-for="pin in 4" :key="`chip-pin-${pin}`" :position="[-0.08 + pin * 0.05, -0.03, 0.08]">
          <TresBoxGeometry :args="[0.015, 0.02, 0.03]" />
          <TresMeshStandardMaterial :color="'#90A4AE'" :metalness="0.9" />
        </TresMesh>
      </TresGroup>
    </TresGroup>
    
    <!-- ========== LED STRIP ========== -->
    <TresGroup>
      <!-- Base -->
      <TresMesh :position="[0, 3.2, -2.55]">
        <TresBoxGeometry :args="[8.5, 0.12, 0.06]" />
        <TresMeshStandardMaterial :color="'#1A1A1A'" />
      </TresMesh>
      
      <!-- LEDs -->
      <TresMesh 
        v-for="led in ledStrip" 
        :key="`led-${led.index}`"
        :position="[led.x, led.y, led.z]"
      >
        <TresSphereGeometry :args="[0.1, quality === 'high' ? 10 : 6, quality === 'high' ? 10 : 6]" />
        <TresMeshBasicMaterial :color="getLedColor(led.index)" />
      </TresMesh>
      
      <!-- Inner glow -->
      <TresMesh 
        v-for="led in ledStrip" 
        :key="`led-glow-${led.index}`"
        :position="[led.x, led.y, led.z + 0.08]"
      >
        <TresSphereGeometry :args="[0.22, 8, 8]" />
        <TresMeshBasicMaterial 
          :color="getLedColor(led.index)"
          :opacity="0.5"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Outer glow -->
      <TresMesh 
        v-for="led in ledStrip" 
        :key="`led-glow2-${led.index}`"
        :position="[led.x, led.y, led.z + 0.12]"
      >
        <TresSphereGeometry :args="[0.38, 6, 6]" />
        <TresMeshBasicMaterial 
          :color="getLedColor(led.index)"
          :opacity="0.22"
          :transparent="true"
        />
      </TresMesh>
      
      <!-- Wall color wash -->
      <TresMesh :position="[0, 3.2, -2.8]">
        <TresPlaneGeometry :args="[9, 2]" />
        <TresMeshBasicMaterial 
          :color="getLedColor(Math.floor(ledCount / 2))"
          :opacity="0.18"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- ========== ATMOSPHERE DUST ========== -->
    <TresMesh 
      v-for="(dust, i) in dustParticles" 
      :key="`dust-${i}`"
      :position="[getDustPos(dust).x, getDustPos(dust).y, getDustPos(dust).z]"
    >
      <TresSphereGeometry :args="[0.012, 4, 4]" />
      <TresMeshBasicMaterial 
        :color="'#FFFFFF'"
        :opacity="0.15"
        :transparent="true"
      />
    </TresMesh>
    
    <!-- ========== BACKDROP ========== -->
    <TresMesh :position="[0, 1.5, -3]">
      <TresPlaneGeometry :args="[10, 6]" />
      <TresMeshStandardMaterial 
        :color="'#101010'" 
        :roughness="0.92"
        :emissive="colors.electronics"
        :emissive-intensity="0.04"
      />
    </TresMesh>
    
  </TresGroup>
  
  <!-- ========== FLOOR ========== -->
  <TresMesh :position="[0, -1.8, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[16, 16]" />
    <TresMeshStandardMaterial 
      :color="'#080808'" 
      :roughness="0.8"
      :emissive="colors.copper"
      :emissive-intensity="0.015"
    />
  </TresMesh>
</template>
