<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

defineProps<{
  quality: QualityLevel
}>()

const sphere1Ref = ref()
const sphere2Ref = ref()
const sphere3Ref = ref()

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000
  // Gentle rotation for the three worlds
  if (sphere1Ref.value) {
    sphere1Ref.value.rotation.y = elapsed * 0.3
    sphere1Ref.value.position.y = Math.sin(elapsed * 0.5) * 0.2
  }
  if (sphere2Ref.value) {
    sphere2Ref.value.rotation.y = -elapsed * 0.2
    sphere2Ref.value.position.y = Math.sin(elapsed * 0.5 + 2) * 0.2
  }
  if (sphere3Ref.value) {
    sphere3Ref.value.rotation.y = elapsed * 0.25
    sphere3Ref.value.position.y = Math.sin(elapsed * 0.5 + 4) * 0.2
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
  <TresPerspectiveCamera :position="[0, 0, 10]" :look-at="[0, 0, 0]" />
  
  <TresAmbientLight :intensity="0.3" />
  <TresPointLight :position="[0, 5, 5]" :intensity="1" color="#FFFFFF" />
  
  <!-- Digital World (Left) -->
  <TresGroup ref="sphere1Ref" :position="[-3.5, 0, 0]">
    <TresMesh>
      <TresIcosahedronGeometry :args="[1.2, quality === 'high' ? 2 : 1]" />
      <TresMeshStandardMaterial
        :color="'#7C3AED'"
        :wireframe="true"
        :emissive="'#7C3AED'"
        :emissive-intensity="0.2"
      />
    </TresMesh>
    <!-- Inner glow -->
    <TresMesh>
      <TresSphereGeometry :args="[0.8, 16, 16]" />
      <TresMeshBasicMaterial
        :color="'#7C3AED'"
        :opacity="0.2"
        :transparent="true"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Physical World (Center) -->
  <TresGroup ref="sphere2Ref" :position="[0, 0, 0]">
    <TresMesh>
      <TresBoxGeometry :args="[1.8, 1.8, 1.8]" />
      <TresMeshStandardMaterial
        :color="'#3F3F46'"
        :roughness="0.8"
        :metalness="0.2"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Human World (Right) -->
  <TresGroup ref="sphere3Ref" :position="[3.5, 0, 0]">
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.4, quality === 'high' ? 32 : 16, quality === 'high' ? 64 : 32]" />
      <TresMeshStandardMaterial
        :color="'#F97316'"
        :emissive="'#F97316'"
        :emissive-intensity="0.1"
        :roughness="0.5"
        :metalness="0.5"
      />
    </TresMesh>
  </TresGroup>
  
  <!-- Connecting beams -->
  <TresMesh :position="[-1.75, 0, 0]" :rotation="[0, 0, Math.PI / 2]">
    <TresCylinderGeometry :args="[0.02, 0.02, 1.5, 8]" />
    <TresMeshBasicMaterial :color="'#A855F7'" :opacity="0.5" :transparent="true" />
  </TresMesh>
  
  <TresMesh :position="[1.75, 0, 0]" :rotation="[0, 0, Math.PI / 2]">
    <TresCylinderGeometry :args="[0.02, 0.02, 1.5, 8]" />
    <TresMeshBasicMaterial :color="'#A855F7'" :opacity="0.5" :transparent="true" />
  </TresMesh>
</template>

