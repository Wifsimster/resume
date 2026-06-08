<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import { Points, type MeshStandardMaterial } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

const props = defineProps<{
  quality: QualityLevel
}>()

// "The Evolution" — a sleek dark server rack standing in for the career
// timeline. A clean frame holds a stack of server blades; a thin emissive
// SCAN LIGHT sweeps vertically up the rack face on a looping sine while
// status LEDs blink. Deliberate and modern, not the old busy version.
const themeColors = {
  primary: '#A855F7', // violet accent
  secondary: '#7C3AED', // deep purple
  tertiary: '#6366F1', // indigo
  scan: '#22D3EE', // cyan scan beam
  dark: '#0F0A1A' // rack body
}

const isMinimal = computed(() => props.quality === 'minimal')

// Sphere detail for LEDs stays cheap; capped at 16 high.
const ledSegments = computed(() => (props.quality === 'high' ? 16 : 8))

// --- Server blades (real box meshes, static layout) ---
const bladeCount = 5
const rackTop = 1.6
const bladeGap = 0.82
const blades = Array.from({ length: bladeCount }, (_, i) => ({
  y: rackTop - i * bladeGap
}))

// --- Status LEDs: a SMALL set of real meshes (<=12). Each gets a ref and is
// mutated directly in `update` via a precomputed plain phase array. No
// reactive per-frame state, no triggerRef. ---
const ledColors = [themeColors.primary, themeColors.secondary, themeColors.tertiary]
const leds = blades.flatMap((blade, b) =>
  Array.from({ length: 2 }, (_, c) => ({
    x: -0.85 + c * 1.7,
    y: blade.y,
    z: 0.56,
    color: ledColors[(b + c) % ledColors.length],
    phase: (b * 2 + c) * 1.31, // deterministic offset, no Math.random per frame
    speed: 1.8 + ((b + c) % 3) * 0.9
  }))
)
const ledRefs = leds.map(() => ref())

// --- Scan light (single thin emissive bar swept along Y) ---
const scanRef = ref()
const rackRef = ref()
const scanTravel = rackTop + 0.4 // half-amplitude of the vertical sweep

// --- Background starfield (single Points draw call) ---
const starField = shallowRef<Points | null>(null)
const buildStars = () => {
  disposeParticleField(starField.value)
  starField.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 500 : 140
  starField.value = createParticleField({
    count,
    color: 0xa855f7,
    size: props.quality === 'high' ? 0.035 : 0.055,
    opacity: 0.45,
    position: (_i, out) => {
      out[0] = (Math.random() - 0.5) * 24
      out[1] = (Math.random() - 0.5) * 16
      out[2] = -4 - Math.random() * 12
    }
  })
}
watch(() => props.quality, buildStars, { immediate: true })

const update = (elapsed: number) => {
  // Whole rack: gentle continuous turn + slow vertical breathe.
  if (rackRef.value) {
    rackRef.value.rotation.y = elapsed * 0.1 + Math.sin(elapsed * 0.5) * 0.12
    rackRef.value.position.y = Math.sin(elapsed * 0.3) * 0.05
  }

  // Scan light: looping sine sweep up/down the rack face, brighter at edges
  // of travel for a "pass" feel.
  if (scanRef.value) {
    const t = Math.sin(elapsed * 0.7)
    scanRef.value.position.y = t * scanTravel
    const mat = scanRef.value.material as MeshStandardMaterial
    mat.opacity = 0.45 + Math.abs(Math.cos(elapsed * 0.7)) * 0.4
  }

  // Status LEDs: mutate emissiveIntensity directly per mesh.
  for (let i = 0; i < ledRefs.length; i++) {
    const obj = ledRefs[i].value
    if (!obj) continue
    const led = leds[i]
    const blink = Math.sin(elapsed * led.speed + led.phase)
    ;(obj.material as MeshStandardMaterial).emissiveIntensity = 0.4 + blink * 0.6
  }

  // Starfield: cheap whole-object drift.
  if (starField.value) starField.value.rotation.y = elapsed * 0.01
}

useSceneAnimation('experience', update, () => {
  disposeParticleField(starField.value)
})

onBeforeUnmount(() => {
  disposeParticleField(starField.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />

  <!-- Lean 3-light rig (was 5) -->
  <TresAmbientLight :intensity="0.3" />
  <TresPointLight :position="[0, 2, 5]" :intensity="1.4" :color="themeColors.primary" :distance="20" />
  <TresPointLight :position="[-4, -2, 4]" :intensity="0.7" :color="themeColors.tertiary" :distance="18" />

  <!-- Server rack -->
  <TresGroup ref="rackRef">
    <!-- Rack frame -->
    <TresMesh>
      <TresBoxGeometry :args="[3, 4, 1]" />
      <TresMeshStandardMaterial
        :color="themeColors.dark"
        :emissive="themeColors.secondary"
        :emissive-intensity="0.06"
        :roughness="0.85"
        :metalness="0.4"
      />
    </TresMesh>

    <!-- Server blades -->
    <TresMesh v-for="(blade, i) in blades" :key="`blade-${i}`" :position="[0, blade.y, 0.32]">
      <TresBoxGeometry :args="[2.6, 0.6, 0.5]" />
      <TresMeshStandardMaterial
        color="#1A1525"
        :emissive="themeColors.primary"
        :emissive-intensity="0.04"
        :roughness="0.6"
        :metalness="0.55"
      />
    </TresMesh>

    <!-- Scan light: thin emissive bar swept vertically -->
    <TresMesh v-if="!isMinimal" ref="scanRef" :position="[0, 0, 0.58]">
      <TresBoxGeometry :args="[2.7, 0.06, 0.02]" />
      <TresMeshStandardMaterial
        :color="themeColors.scan"
        :emissive="themeColors.scan"
        :emissive-intensity="2.0"
        :transparent="true"
        :opacity="0.6"
        :depth-write="false"
      />
    </TresMesh>

    <!-- Status LEDs (<=12 real meshes, mutated directly) -->
    <TresMesh
      v-for="(led, i) in leds"
      :key="`led-${i}`"
      :ref="el => (ledRefs[i].value = el)"
      :position="[led.x, led.y, led.z]"
    >
      <TresSphereGeometry :args="[0.05, ledSegments, ledSegments]" />
      <TresMeshStandardMaterial
        :color="led.color"
        :emissive="led.color"
        :emissive-intensity="1"
      />
    </TresMesh>
  </TresGroup>

  <!-- Background starfield (single Points draw call) -->
  <primitive v-if="starField" :object="starField" />
</template>
