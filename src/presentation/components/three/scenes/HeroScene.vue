<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import {
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Points,
  AdditiveBlending
} from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

const props = defineProps<{
  quality: QualityLevel
}>()

// "The Knowledge Architect" — a faceted core with passion nodes orbiting on
// elliptical paths, each wired back to the core by a live spoke. The constant
// re-wiring reads as a thinking, connected mind rather than the orbiting-balls
// motif used by the About scene.
const themeColors = {
  core: '#7C3AED',
  energy: '#22D3EE',
  spoke: '#A855F7'
}

const passionNodes = [
  { color: '#A855F7' },
  { color: '#6366F1' },
  { color: '#FBBF24' },
  { color: '#8B5CF6' },
  { color: '#F97316' },
  { color: '#EC4899' },
  { color: '#3B82F6' }
]

const coreRef = ref()
const shellRef = ref()
const latticeRef = ref()
const ringRef = ref()
const nodeRefs = passionNodes.map(() => ref())

const isMinimal = computed(() => props.quality === 'minimal')

// Geometry detail scales with quality; capped well below the old 64/128 values
// which cost fill rate without a visible difference at this object size.
const coreSegments = computed(() => (props.quality === 'high' ? 32 : props.quality === 'low' ? 16 : 8))
const nodeSegments = computed(() => (props.quality === 'high' ? 20 : props.quality === 'low' ? 12 : 6))
const ringSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// Orbital configuration (elliptical, tilted, individually paced)
const orbitRadius = 3.2
const eccentricity = [1.0, 1.15, 0.95, 1.1, 0.9, 1.05, 1.2]
const tilts = [0, 0.2, -0.15, 0.1, -0.25, 0.18, -0.12]
const speeds = [0.18, 0.22, 0.16, 0.25, 0.2, 0.17, 0.24]

const nodePos = { x: 0, y: 0, z: 0 }
const computeOrbit = (i: number, t: number) => {
  const angle = (i / passionNodes.length) * Math.PI * 2 + t * speeds[i]
  const breathe = 1 + Math.sin(t * 0.25 + i * 0.7) * 0.06
  nodePos.x = Math.cos(angle) * orbitRadius * eccentricity[i] * breathe
  nodePos.y = Math.sin(t * 0.3 + i * 0.9) * (0.4 + Math.sin(i * 1.5) * 0.15) + Math.sin(angle) * tilts[i] * 1.5
  nodePos.z = Math.sin(angle) * (orbitRadius / eccentricity[i]) * breathe
}

// Single-draw-call spoke network: one line segment from the core to each node.
const spokeLines = shallowRef<LineSegments | null>(null)
let spokePositions: Float32Array | null = null

const buildSpokes = () => {
  if (spokeLines.value) {
    spokeLines.value.geometry.dispose()
    ;(spokeLines.value.material as LineBasicMaterial).dispose()
    spokeLines.value = null
  }
  if (isMinimal.value) {
    spokePositions = null
    return
  }
  spokePositions = new Float32Array(passionNodes.length * 2 * 3)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(spokePositions, 3))
  const material = new LineBasicMaterial({
    color: themeColors.spoke,
    transparent: true,
    opacity: 0.22,
    blending: AdditiveBlending,
    depthWrite: false
  })
  spokeLines.value = new LineSegments(geometry, material)
}

// Background starfield (single Points draw call)
const starField = shallowRef<Points | null>(null)
const buildStars = () => {
  disposeParticleField(starField.value)
  starField.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 600 : 160
  starField.value = createParticleField({
    count,
    color: 0xffffff,
    size: props.quality === 'high' ? 0.03 : 0.05,
    opacity: 0.55,
    position: (_i, out) => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 16 + Math.random() * 24
      out[0] = r * Math.sin(phi) * Math.cos(theta)
      out[1] = r * Math.sin(phi) * Math.sin(theta)
      out[2] = r * Math.cos(phi)
    }
  })
}

const rebuild = () => {
  buildSpokes()
  buildStars()
}
watch(() => props.quality, rebuild, { immediate: true })

const update = (elapsed: number, delta: number) => {
  // Delta-scaled exponential smoothing (~0.08/frame at 60Hz) so the node
  // easing speed is identical at 30, 60 or 144 Hz.
  const smoothing = 1 - Math.exp(-delta * 0.005)

  // Orbiting passion nodes + live spokes
  for (let i = 0; i < nodeRefs.length; i++) {
    const obj = nodeRefs[i].value
    computeOrbit(i, elapsed)
    if (obj) {
      obj.position.x += (nodePos.x - obj.position.x) * smoothing
      obj.position.y += (nodePos.y - obj.position.y) * smoothing
      obj.position.z += (nodePos.z - obj.position.z) * smoothing
      obj.rotation.y = elapsed * (0.4 + i * 0.1)
      const s = 1 + Math.sin(elapsed * 1.2 + i * 0.6) * 0.1
      obj.scale.setScalar(s)
    }
    if (spokePositions) {
      const o = i * 6
      // start at core, end at the (smoothed) node position
      spokePositions[o + 3] = obj ? obj.position.x : nodePos.x
      spokePositions[o + 4] = obj ? obj.position.y : nodePos.y
      spokePositions[o + 5] = obj ? obj.position.z : nodePos.z
    }
  }
  if (spokeLines.value && spokePositions) {
    ;(spokeLines.value.geometry.getAttribute('position') as BufferAttribute).needsUpdate = true
  }

  if (coreRef.value) {
    coreRef.value.rotation.y = elapsed * 0.18
    coreRef.value.rotation.x = Math.sin(elapsed * 0.15) * 0.1
    const p = 1 + Math.sin(elapsed * 1.1) * 0.08
    coreRef.value.scale.setScalar(p)
  }
  if (shellRef.value) {
    shellRef.value.rotation.y = -elapsed * 0.12
  }
  if (latticeRef.value) {
    latticeRef.value.rotation.y = -elapsed * 0.06
    latticeRef.value.rotation.z = elapsed * 0.04
  }
  if (ringRef.value) ringRef.value.rotation.z = elapsed * 0.05
  if (starField.value) starField.value.rotation.y = elapsed * 0.004
}

useSceneAnimation('hero', update, () => {
  disposeParticleField(starField.value)
  if (spokeLines.value) {
    spokeLines.value.geometry.dispose()
    ;(spokeLines.value.material as LineBasicMaterial).dispose()
  }
})

onBeforeUnmount(() => {
  disposeParticleField(starField.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 1, 10]" :look-at="[0, 0, 0]" />

  <!-- Lean 3-light rig (was 6) -->
  <TresAmbientLight :intensity="0.35" />
  <TresPointLight :position="[0, 0, 2]" :intensity="2.4" :color="themeColors.core" :distance="14" />
  <TresPointLight :position="[6, 4, -2]" :intensity="0.9" :color="themeColors.energy" :distance="18" />

  <!-- Central faceted core + a single glow shell (was 4 nested glow spheres) -->
  <TresGroup ref="coreRef">
    <TresMesh>
      <TresIcosahedronGeometry :args="[0.9, 1]" />
      <TresMeshStandardMaterial
        :color="themeColors.core"
        :emissive="themeColors.core"
        :emissive-intensity="0.9"
        :metalness="0.9"
        :roughness="0.15"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal" ref="shellRef">
      <TresIcosahedronGeometry :args="[1.25, coreSegments > 16 ? 1 : 0]" />
      <TresMeshBasicMaterial
        :color="themeColors.core"
        :opacity="0.12"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Architectural wireframe lattice (one mesh) -->
  <TresMesh v-if="!isMinimal" ref="latticeRef">
    <TresIcosahedronGeometry :args="[2.0, 1]" />
    <TresMeshBasicMaterial
      :color="themeColors.spoke"
      :wireframe="true"
      :opacity="0.14"
      :transparent="true"
      :depth-write="false"
    />
  </TresMesh>

  <!-- Single orbital guide ring -->
  <TresMesh ref="ringRef" :rotation="[Math.PI / 2, 0, 0]">
    <TresTorusGeometry :args="[orbitRadius, 0.01, 6, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.spoke" :opacity="0.18" :transparent="true" :depth-write="false" />
  </TresMesh>

  <!-- Orbiting passion nodes (one solid sphere each; glow handled by spokes) -->
  <TresMesh v-for="(node, i) in passionNodes" :key="i" :ref="el => (nodeRefs[i].value = el)">
    <TresSphereGeometry :args="[0.26, nodeSegments, nodeSegments]" />
    <TresMeshStandardMaterial
      :color="node.color"
      :emissive="node.color"
      :emissive-intensity="0.6"
      :roughness="0.3"
      :metalness="0.6"
    />
  </TresMesh>

  <!-- Live spoke network + starfield (single draw call each) -->
  <primitive v-if="spokeLines" :object="spokeLines" />
  <primitive v-if="starField" :object="starField" />
</template>
