<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import {
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Points,
  AdditiveBlending,
  type MeshBasicMaterial
} from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

const props = defineProps<{
  quality: QualityLevel
}>()

// "Signal Beacon / Network" — an emissive faceted node broadcasts outward.
// Concentric signal rings pulse out and fade, while contact-channel nodes
// (email / GitHub / LinkedIn / …) orbit and stay wired to the beacon by a
// single live spoke network. This broadcasting, outward motif is deliberately
// distinct from Hero's inward, gravitational constellation.
const themeColors = {
  core: '#00FF41',   // terminal green beacon
  signal: '#00FFFF', // cyan signal rings
  spoke: '#3B82F6'   // blue uplinks
}

// Each orbiting node is a contact channel; distinct emissive colors read as
// distinct destinations rather than identical satellites.
const channelNodes = [
  { color: '#00FFFF' }, // email
  { color: '#A855F7' }, // GitHub
  { color: '#3B82F6' }, // LinkedIn
  { color: '#FBBF24' }, // resume / phone
  { color: '#EC4899' }  // social
]

const coreRef = ref()
const shellRef = ref()
const ringGuideRef = ref()
const nodeRefs = channelNodes.map(() => ref())
const rippleRefs = [ref(), ref(), ref()]

const isMinimal = computed(() => props.quality === 'minimal')

// Detail capped well below the old 64/128 values; invisible cost at this scale.
const coreSegments = computed(() => (props.quality === 'high' ? 32 : props.quality === 'low' ? 16 : 8))
const ringRadialSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// Channel orbit configuration (gentle shared ring, individually paced)
const orbitRadius = 2.4
const tilts = [0, 0.18, -0.14, 0.1, -0.2]
const speeds = [0.16, 0.2, 0.14, 0.22, 0.18]

const nodePos = { x: 0, y: 0, z: 0 }
const computeOrbit = (i: number, t: number) => {
  const angle = (i / channelNodes.length) * Math.PI * 2 + t * speeds[i]
  const breathe = 1 + Math.sin(t * 0.3 + i * 0.8) * 0.05
  nodePos.x = Math.cos(angle) * orbitRadius * breathe
  nodePos.y = Math.sin(t * 0.35 + i * 0.9) * 0.3 + Math.sin(angle) * tilts[i] * 1.4
  nodePos.z = Math.sin(angle) * orbitRadius * breathe
}

// Single-draw-call uplink network: one segment from the beacon to each node.
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
  spokePositions = new Float32Array(channelNodes.length * 2 * 3)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(spokePositions, 3))
  const material = new LineBasicMaterial({
    color: themeColors.spoke,
    transparent: true,
    opacity: 0.24,
    blending: AdditiveBlending,
    depthWrite: false
  })
  spokeLines.value = new LineSegments(geometry, material)
}

// One subtle network dust field (single Points draw call).
const dustField = shallowRef<Points | null>(null)
const buildDust = () => {
  disposeParticleField(dustField.value)
  dustField.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 220 : 70
  dustField.value = createParticleField({
    count,
    color: 0x00ff88,
    size: props.quality === 'high' ? 0.025 : 0.04,
    opacity: 0.4,
    additive: true,
    position: (_i, out) => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4 + Math.random() * 8
      out[0] = r * Math.sin(phi) * Math.cos(theta)
      out[1] = r * Math.sin(phi) * Math.sin(theta)
      out[2] = r * Math.cos(phi)
    }
  })
}

const rebuild = () => {
  buildSpokes()
  buildDust()
}
watch(() => props.quality, rebuild, { immediate: true })

// Phase offsets for the three signal rings so they broadcast in a staggered cycle.
const ripplePhase = [0, 1 / 3, 2 / 3]

const update = (elapsed: number) => {
  // Orbiting channel nodes + live uplinks
  for (let i = 0; i < nodeRefs.length; i++) {
    const obj = nodeRefs[i].value
    computeOrbit(i, elapsed)
    if (obj) {
      obj.position.x += (nodePos.x - obj.position.x) * 0.08
      obj.position.y += (nodePos.y - obj.position.y) * 0.08
      obj.position.z += (nodePos.z - obj.position.z) * 0.08
      obj.rotation.y = elapsed * (0.4 + i * 0.1)
      const s = 1 + Math.sin(elapsed * 1.3 + i * 0.6) * 0.12
      obj.scale.setScalar(s)
    }
    if (spokePositions) {
      const o = i * 6
      // start vertex stays at the beacon (0,0,0); end vertex tracks the node
      spokePositions[o + 3] = obj ? obj.position.x : nodePos.x
      spokePositions[o + 4] = obj ? obj.position.y : nodePos.y
      spokePositions[o + 5] = obj ? obj.position.z : nodePos.z
    }
  }
  if (spokeLines.value && spokePositions) {
    ;(spokeLines.value.geometry.getAttribute('position') as BufferAttribute).needsUpdate = true
  }

  // Central beacon
  if (coreRef.value) {
    coreRef.value.rotation.y = elapsed * 0.2
    coreRef.value.rotation.x = Math.sin(elapsed * 0.15) * 0.1
    const p = 1 + Math.sin(elapsed * 1.4) * 0.1
    coreRef.value.scale.setScalar(p)
  }
  if (shellRef.value) shellRef.value.rotation.y = -elapsed * 0.12
  if (ringGuideRef.value) ringGuideRef.value.rotation.z = elapsed * 0.05

  // Signal rings: expand outward and fade on a looping cycle. Mutating
  // material.opacity directly is cheap for only three rings.
  for (let i = 0; i < rippleRefs.length; i++) {
    const ring = rippleRefs[i].value
    if (!ring) continue
    const cycle = (elapsed * 0.2 + ripplePhase[i]) % 1
    const scale = 1 + cycle * 3.5
    ring.scale.set(scale, scale, 1)
    const mat = ring.material as MeshBasicMaterial | undefined
    if (mat) mat.opacity = (1 - cycle) * 0.3
  }

  // Animate the dust by rotating the whole Points object (no per-vertex work).
  if (dustField.value) {
    dustField.value.rotation.y = elapsed * 0.01
    dustField.value.rotation.x = Math.sin(elapsed * 0.04) * 0.02
  }
}

useSceneAnimation('contact', update, () => {
  disposeParticleField(dustField.value)
  if (spokeLines.value) {
    spokeLines.value.geometry.dispose()
    ;(spokeLines.value.material as LineBasicMaterial).dispose()
  }
})

onBeforeUnmount(() => {
  disposeParticleField(dustField.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0.6, 8]" :look-at="[0, 0, 0]" />

  <!-- 3-light rig (was 4 + floor lighting) -->
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 0, 2]" :intensity="2.2" :color="themeColors.core" :distance="14" />
  <TresPointLight :position="[5, 3, -2]" :intensity="0.8" :color="themeColors.signal" :distance="18" />

  <!-- Central beacon: faceted emissive node + a single glow shell -->
  <TresGroup ref="coreRef">
    <TresMesh>
      <TresIcosahedronGeometry :args="[0.55, 1]" />
      <TresMeshStandardMaterial
        :color="themeColors.core"
        :emissive="themeColors.core"
        :emissive-intensity="1.1"
        :metalness="0.9"
        :roughness="0.12"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal" ref="shellRef">
      <TresIcosahedronGeometry :args="[0.85, coreSegments > 16 ? 1 : 0]" />
      <TresMeshBasicMaterial
        :color="themeColors.core"
        :opacity="0.12"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Concentric signal rings broadcasting outward (≤3, thin, depthWrite off) -->
  <TresMesh
    v-for="(_, i) in 3"
    :key="`ripple-${i}`"
    :ref="el => (rippleRefs[i].value = el)"
    :rotation="[Math.PI / 2, 0, 0]"
  >
    <TresRingGeometry :args="[0.7, 0.72, ringRadialSegments]" />
    <TresMeshBasicMaterial
      :color="i === 1 ? themeColors.signal : themeColors.core"
      :opacity="0.3"
      :transparent="true"
      :depth-write="false"
      :side="2"
    />
  </TresMesh>

  <!-- Single orbital guide ring -->
  <TresMesh ref="ringGuideRef" :rotation="[Math.PI / 2, 0, 0]">
    <TresTorusGeometry :args="[orbitRadius, 0.008, 6, ringRadialSegments]" />
    <TresMeshBasicMaterial :color="themeColors.spoke" :opacity="0.16" :transparent="true" :depth-write="false" />
  </TresMesh>

  <!-- Orbiting contact-channel nodes (one solid emissive shape each) -->
  <TresMesh v-for="(node, i) in channelNodes" :key="i" :ref="el => (nodeRefs[i].value = el)">
    <TresOctahedronGeometry :args="[0.2, 0]" />
    <TresMeshStandardMaterial
      :color="node.color"
      :emissive="node.color"
      :emissive-intensity="0.7"
      :roughness="0.25"
      :metalness="0.7"
      :flat-shading="true"
    />
  </TresMesh>

  <!-- Live uplink network + network dust (single draw call each) -->
  <primitive v-if="spokeLines" :object="spokeLines" />
  <primitive v-if="dustField" :object="dustField" />
</template>
