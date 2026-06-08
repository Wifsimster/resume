<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import { Points } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

const props = defineProps<{
  quality: QualityLevel
}>()

// "Ascending Growth" — a vertical, climbing composition that reads as
// motivation/aspiration. A rising luminous helix of light motes spirals upward
// around a thin central light column, while the three theme symbols
// (Vision / Growth / Innovation) sit at increasing heights, each slowly turning
// and bobbing on a sine. The strictly vertical, upward motif keeps this scene
// visually distinct from the Hero (constellation) and About scenes.
const themeColors = {
  column: '#A855F7',
  helix: '#22D3EE',
  vision: '#00FF88',
  growth: '#FBBF24',
  innovation: '#EC4899'
}

const columnRef = ref()
const visionRef = ref()
const growthRef = ref()
const innovationRef = ref()

const isMinimal = computed(() => props.quality === 'minimal')

// Geometry detail scales with quality; capped per the performance budget.
const symbolSegments = computed(() => (props.quality === 'high' ? 24 : props.quality === 'low' ? 16 : 8))
const ringSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// Helix geometry: motes spiral up a constant-radius column from y=-4..+4.
const helixHeight = 8
const helixRadius = 1.4
const helixTurns = 5

// Rising luminous helix (single Points draw call). Positions are computed once
// at build time; animation is pure group rotation + Y oscillation.
const helixField = shallowRef<Points | null>(null)
const buildHelix = () => {
  disposeParticleField(helixField.value)
  helixField.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 500 : 180
  const k = (helixTurns * Math.PI * 2) / count
  helixField.value = createParticleField({
    count,
    color: themeColors.helix,
    size: props.quality === 'high' ? 0.05 : 0.07,
    opacity: 0.7,
    additive: true,
    position: (i, out) => {
      const angle = i * k
      // Slight radial jitter so the helix reads as a luminous band, not a wire.
      const r = helixRadius + (Math.random() - 0.5) * 0.25
      out[0] = Math.cos(angle) * r
      out[1] = -helixHeight / 2 + (i / count) * helixHeight
      out[2] = Math.sin(angle) * r
    }
  })
}

watch(() => props.quality, buildHelix, { immediate: true })

const update = (elapsed: number) => {
  // Helix: rotate the whole Points group around Y, gently oscillate its height.
  if (helixField.value) {
    helixField.value.rotation.y = elapsed * 0.18
    helixField.value.position.y = Math.sin(elapsed * 0.4) * 0.3
  }

  // Central light column: slow rotation + a subtle vertical breathing scale.
  if (columnRef.value) {
    columnRef.value.rotation.y = elapsed * 0.1
    const breathe = 1 + Math.sin(elapsed * 0.9) * 0.04
    columnRef.value.scale.set(breathe, 1, breathe)
  }

  // Vision — eye/iris near the top: slow turn + rise-then-loop bob.
  if (visionRef.value) {
    visionRef.value.rotation.y = elapsed * 0.25
    visionRef.value.position.y = 2.6 + Math.sin(elapsed * 0.7) * 0.35
  }

  // Growth — sprouting/branching form mid-axis: rises with a pulsing scale.
  if (growthRef.value) {
    growthRef.value.rotation.y = -elapsed * 0.2
    growthRef.value.position.y = 0.2 + Math.sin(elapsed * 0.6 + 1.2) * 0.4
    const s = 1 + Math.sin(elapsed * 1.1) * 0.08
    growthRef.value.scale.setScalar(s)
  }

  // Innovation — spark/star low on the axis: faster spin + tumble + bob.
  if (innovationRef.value) {
    innovationRef.value.rotation.y = elapsed * 0.4
    innovationRef.value.rotation.x = Math.sin(elapsed * 0.5) * 0.3
    innovationRef.value.position.y = -2.4 + Math.sin(elapsed * 0.8 + 2.1) * 0.3
  }
}

useSceneAnimation('motivation', update, () => {
  disposeParticleField(helixField.value)
})

onBeforeUnmount(() => {
  disposeParticleField(helixField.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 11]" :look-at="[0, 0, 0]" />

  <!-- Lean 3-light rig (was 6) -->
  <TresAmbientLight :intensity="0.3" />
  <!-- Warm key low on the axis, cool fill high — reinforces the upward climb -->
  <TresPointLight :position="[2, -4, 4]" :intensity="2.2" :color="themeColors.growth" :distance="16" />
  <TresPointLight :position="[-3, 5, 3]" :intensity="1.4" :color="themeColors.helix" :distance="18" />

  <!-- Central light column: one thin cylinder + a single subtle glow sleeve -->
  <TresGroup ref="columnRef">
    <TresMesh>
      <TresCylinderGeometry :args="[0.06, 0.06, helixHeight, 8]" />
      <TresMeshStandardMaterial
        :color="themeColors.column"
        :emissive="themeColors.column"
        :emissive-intensity="1.2"
        :metalness="0.6"
        :roughness="0.2"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresCylinderGeometry :args="[0.22, 0.22, helixHeight, 8]" />
      <TresMeshBasicMaterial
        :color="themeColors.column"
        :opacity="0.12"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Vision — eye-like iris (ring + emissive pupil) near the top -->
  <TresGroup ref="visionRef" :position="[0, 2.6, 0]">
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.5, 0.07, 8, ringSegments]" />
      <TresMeshStandardMaterial
        :color="themeColors.vision"
        :emissive="themeColors.vision"
        :emissive-intensity="0.9"
        :metalness="0.5"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh>
      <TresSphereGeometry :args="[0.22, symbolSegments, symbolSegments]" />
      <TresMeshStandardMaterial
        :color="'#FFFFFF'"
        :emissive="themeColors.vision"
        :emissive-intensity="1.1"
        :metalness="0.4"
        :roughness="0.1"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.7, symbolSegments, symbolSegments]" />
      <TresMeshBasicMaterial
        :color="themeColors.vision"
        :opacity="0.13"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Growth — a sprouting/branching form (stem + three radiating cones) -->
  <TresGroup ref="growthRef" :position="[0, 0.2, 0]">
    <TresMesh :position="[0, 0, 0]">
      <TresCylinderGeometry :args="[0.06, 0.1, 0.7, 6]" />
      <TresMeshStandardMaterial
        :color="themeColors.growth"
        :emissive="themeColors.growth"
        :emissive-intensity="0.7"
        :metalness="0.4"
        :roughness="0.4"
      />
    </TresMesh>
    <TresMesh :position="[0, 0.45, 0]">
      <TresConeGeometry :args="[0.16, 0.5, symbolSegments]" />
      <TresMeshStandardMaterial
        :color="themeColors.growth"
        :emissive="themeColors.growth"
        :emissive-intensity="0.9"
        :metalness="0.4"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh :position="[0.32, 0.25, 0]" :rotation="[0, 0, -0.9]">
      <TresConeGeometry :args="[0.11, 0.4, symbolSegments]" />
      <TresMeshStandardMaterial
        :color="themeColors.growth"
        :emissive="themeColors.growth"
        :emissive-intensity="0.8"
        :metalness="0.4"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh :position="[-0.32, 0.25, 0]" :rotation="[0, 0, 0.9]">
      <TresConeGeometry :args="[0.11, 0.4, symbolSegments]" />
      <TresMeshStandardMaterial
        :color="themeColors.growth"
        :emissive="themeColors.growth"
        :emissive-intensity="0.8"
        :metalness="0.4"
        :roughness="0.3"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.8, symbolSegments, symbolSegments]" />
      <TresMeshBasicMaterial
        :color="themeColors.growth"
        :opacity="0.12"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Innovation — a spark/star (twin crossed octahedra) low on the axis -->
  <TresGroup ref="innovationRef" :position="[0, -2.4, 0]">
    <TresMesh>
      <TresOctahedronGeometry :args="[0.45, 0]" />
      <TresMeshStandardMaterial
        :color="themeColors.innovation"
        :emissive="themeColors.innovation"
        :emissive-intensity="1.0"
        :metalness="0.6"
        :roughness="0.2"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh :rotation="[0, Math.PI / 4, Math.PI / 4]">
      <TresOctahedronGeometry :args="[0.3, 0]" />
      <TresMeshStandardMaterial
        :color="'#FFFFFF'"
        :emissive="themeColors.innovation"
        :emissive-intensity="1.2"
        :metalness="0.6"
        :roughness="0.1"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[0.75, symbolSegments, symbolSegments]" />
      <TresMeshBasicMaterial
        :color="themeColors.innovation"
        :opacity="0.13"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Rising luminous helix of light motes (single Points draw call) -->
  <primitive v-if="helixField" :object="helixField" />
</template>
