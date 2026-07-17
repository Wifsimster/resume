<script setup lang="ts">
import { ref, shallowRef, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { Points, type CanvasTexture } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'
import {
  createRockyTexture,
  createGasGiantTexture,
  createSunTexture,
  createRingTexture
} from '../utils/proceduralTextures'

const props = defineProps<{
  quality: QualityLevel
}>()

// "Système Solaire" — a stylized low-poly solar system. An emissive sun is the
// single real light source; seven flat-shaded planets ride individually tilted
// orbital planes at Kepler-scaled speeds (outer = slower), with thin orbit
// guides, an asteroid belt, one ringed planet and one moon. The whole system
// slowly precesses for parallax depth against a distant starfield.
const themeColors = {
  sun: '#FDB813',
  sunGlow: '#FF9E4A',
  guide: '#8B5CF6',
  fill: '#22D3EE'
}

interface PlanetDef {
  color: string
  size: number
  orbit: number
  inclination: number
  node: number
  phase: number
  spin: number
  hasRing?: boolean
  hasMoon?: boolean
  /** Procedural surface (high quality only): rocky splotches or gas bands. */
  kind: 'rocky' | 'gas'
  shadow?: string
  highlight?: string
  bands?: string[]
}

// Orbit radii compressed to the camera frustum; speeds follow Kepler's third
// law (ω ∝ r^-1.5) so inner planets visibly outrun outer ones.
const planets: PlanetDef[] = [
  { color: '#A78BFA', size: 0.13, orbit: 1.6, inclination: 0.06, node: 0.0, phase: 0.0, spin: 0.9,
    kind: 'rocky', shadow: '#6D51C8', highlight: '#D6C6FF' },
  { color: '#F59E0B', size: 0.21, orbit: 2.2, inclination: -0.09, node: 0.6, phase: 2.1, spin: 0.7,
    kind: 'rocky', shadow: '#B45309', highlight: '#FDE68A' },
  { color: '#22D3EE', size: 0.24, orbit: 2.8, inclination: 0.04, node: 1.9, phase: 4.0, spin: 0.8, hasMoon: true,
    kind: 'rocky', shadow: '#0E7490', highlight: '#A5F3FC' },
  { color: '#F97316', size: 0.17, orbit: 3.4, inclination: 0.12, node: 2.8, phase: 1.2, spin: 0.75,
    kind: 'rocky', shadow: '#9A3412', highlight: '#FDBA74' },
  { color: '#FBBF24', size: 0.42, orbit: 4.3, inclination: -0.07, node: 4.1, phase: 5.3, spin: 0.5,
    kind: 'gas', bands: ['#FBBF24', '#D97706', '#FDE68A', '#B45309', '#F59E0B'] },
  { color: '#EC4899', size: 0.34, orbit: 5.1, inclination: 0.14, node: 5.0, phase: 3.0, spin: 0.45, hasRing: true,
    kind: 'gas', bands: ['#EC4899', '#BE185D', '#F9A8D4', '#DB2777'] },
  { color: '#3B82F6', size: 0.26, orbit: 5.8, inclination: -0.11, node: 0.9, phase: 0.7, spin: 0.6,
    kind: 'gas', bands: ['#3B82F6', '#1E40AF', '#93C5FD', '#2563EB'] }
]

const KEPLER_K = 1.15
const orbitalSpeeds = planets.map((p) => KEPLER_K / Math.pow(p.orbit, 1.5))

const sunRef = ref()
const coronaRef = ref()
const systemRef = ref()
const planetRefs = planets.map(() => ref())
const spinRefs = planets.map(() => ref())
const moonPivotRefs = planets.map(() => ref())

const isMinimal = computed(() => props.quality === 'minimal')

// Geometry detail scales with quality. High tier renders smooth, textured
// spheres; low/minimal keep the cheaper stylized flat-shaded look.
const sunSegments = computed(() => (props.quality === 'high' ? 48 : props.quality === 'low' ? 20 : 12))
const planetSegments = computed(() => (props.quality === 'high' ? 32 : props.quality === 'low' ? 12 : 8))
const guideSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// --- Procedural surface textures (high quality only, generated once) ---
const planetMaps = shallowRef<(CanvasTexture | null)[]>(planets.map(() => null))
const sunMap = shallowRef<CanvasTexture | null>(null)
const ringMap = shallowRef<CanvasTexture | null>(null)
const moonMap = shallowRef<CanvasTexture | null>(null)

const collectMaps = () =>
  [...planetMaps.value, sunMap.value, ringMap.value, moonMap.value].filter(
    (t): t is CanvasTexture => t !== null
  )

const disposeMaps = () => {
  for (const t of collectMaps()) t.dispose()
  planetMaps.value = planets.map(() => null)
  sunMap.value = null
  ringMap.value = null
  moonMap.value = null
}

const buildMaps = () => {
  // Swap refs first, dispose the previous GPU textures only AFTER Vue has
  // re-patched the materials — disposing synchronously leaves materials
  // sampling a dead texture for a frame (renders as white artifacts).
  const previous = collectMaps()

  if (props.quality === 'high') {
    planetMaps.value = planets.map((p, i) =>
      p.kind === 'gas'
        ? createGasGiantTexture(p.bands!, i + 1)
        : createRockyTexture(p.color, p.shadow!, p.highlight!, i + 1)
    )
    sunMap.value = createSunTexture()
    ringMap.value = createRingTexture('#F9A8D4')
    moonMap.value = createRockyTexture('#94A3B8', '#64748B', '#E2E8F0', 42)
  } else {
    planetMaps.value = planets.map(() => null)
    sunMap.value = null
    ringMap.value = null
    moonMap.value = null
  }

  if (previous.length > 0) {
    nextTick(() => {
      for (const t of previous) t.dispose()
    })
  }
}

// --- Background starfield (single Points draw call) ---
const starField = shallowRef<Points | null>(null)
const buildStars = () => {
  disposeParticleField(starField.value)
  starField.value = null
  if (isMinimal.value) return
  // Star size stays comfortably above one on-screen pixel — sub-pixel point
  // sprites twinkle hard at real frame rates, which reads as flickering.
  const count = props.quality === 'high' ? 700 : 200
  starField.value = createParticleField({
    count,
    color: 0xffffff,
    size: props.quality === 'high' ? 0.06 : 0.08,
    opacity: 0.5,
    position: (_i, out) => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 18 + Math.random() * 26
      out[0] = r * Math.sin(phi) * Math.cos(theta)
      out[1] = r * Math.sin(phi) * Math.sin(theta)
      out[2] = r * Math.cos(phi)
    }
  })
}

// --- Asteroid belt between the 4th and 5th orbits (single Points draw call) ---
const BELT_INNER = 3.7
const BELT_OUTER = 4.05
const belt = shallowRef<Points | null>(null)
const buildBelt = () => {
  disposeParticleField(belt.value)
  belt.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 450 : 160
  belt.value = createParticleField({
    count,
    color: 0xc4b5a0,
    size: props.quality === 'high' ? 0.055 : 0.07,
    opacity: 0.6,
    position: (_i, out) => {
      const angle = Math.random() * Math.PI * 2
      const r = BELT_INNER + Math.random() * (BELT_OUTER - BELT_INNER)
      out[0] = Math.cos(angle) * r
      out[1] = (Math.random() - 0.5) * 0.12
      out[2] = Math.sin(angle) * r
    }
  })
}

const rebuild = () => {
  buildStars()
  buildBelt()
  buildMaps()
}
watch(() => props.quality, rebuild, { immediate: true })

const update = (elapsed: number) => {
  // Sun: slow roll + gentle breathing pulse; corona counter-rotates.
  if (sunRef.value) {
    sunRef.value.rotation.y = elapsed * 0.05
    const pulse = 1 + Math.sin(elapsed * 0.8) * 0.025
    sunRef.value.scale.setScalar(pulse)
  }
  if (coronaRef.value) coronaRef.value.rotation.y = -elapsed * 0.03

  // Whole system precesses slowly for parallax depth.
  if (systemRef.value) systemRef.value.rotation.y = elapsed * 0.02

  // Planets: Kepler-scaled circular motion inside each tilted orbital plane
  // (local y stays 0 — the plane group carries inclination and node, and the
  // orbit guide shares the exact same transform so paths always align).
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i]
    const planet = planetRefs[i].value
    if (planet) {
      const angle = p.phase + elapsed * orbitalSpeeds[i]
      planet.position.set(Math.cos(angle) * p.orbit, 0, Math.sin(angle) * p.orbit)
    }
    const sphere = spinRefs[i].value
    if (sphere) sphere.rotation.y = elapsed * p.spin
    const moonPivot = moonPivotRefs[i].value
    if (moonPivot) moonPivot.rotation.y = elapsed * 1.1
  }

  // Belt drifts on top of the system precession; stars barely move.
  if (belt.value) belt.value.rotation.y = elapsed * 0.015
  if (starField.value) starField.value.rotation.y = elapsed * 0.004
}

useSceneAnimation('hero', update, () => {
  disposeParticleField(starField.value)
  disposeParticleField(belt.value)
  disposeMaps()
})

onBeforeUnmount(() => {
  disposeParticleField(starField.value)
  disposeParticleField(belt.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 4.2, 9.8]" :look-at="[0, 0, 0]" />

  <!-- The sun is the light source: warm point light at the center. -->
  <TresAmbientLight :intensity="0.25" />
  <TresPointLight :position="[0, 0, 0]" :intensity="4" :color="'#FFD9A0'" :distance="26" :decay="1" />
  <TresPointLight
    v-if="!isMinimal"
    :position="[8, 5, 6]"
    :intensity="0.4"
    :color="themeColors.fill"
    :distance="25"
  />

  <!-- Sun: emissive core + additive corona shells -->
  <TresGroup>
    <TresMesh ref="sunRef">
      <TresSphereGeometry :args="[0.8, sunSegments, sunSegments]" />
      <!-- :key forces a fresh material when the texture set flips (shader
           program must be rebuilt when a map is added/removed) -->
      <TresMeshBasicMaterial
        :key="sunMap ? 'sun-tex' : 'sun-flat'"
        :map="sunMap"
        :color="sunMap ? '#FFFFFF' : themeColors.sun"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal" ref="coronaRef">
      <TresSphereGeometry :args="[1.05, sunSegments, sunSegments]" />
      <TresMeshBasicMaterial
        :color="themeColors.sunGlow"
        :opacity="0.22"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal">
      <TresSphereGeometry :args="[1.45, sunSegments, sunSegments]" />
      <TresMeshBasicMaterial
        :color="themeColors.sunGlow"
        :opacity="0.08"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Planetary system: orbital planes carry inclination + node so the guide
       ring and the moving planet always share the exact same transform. -->
  <TresGroup ref="systemRef">
    <!-- Inclination is a small X tilt; the ascending node rotates about Y so
         the planes stay near-planar like a real ecliptic. -->
    <TresGroup
      v-for="(p, i) in planets"
      :key="`plane-${i}`"
      :rotation="[p.inclination, p.node, 0]"
    >
      <!-- Orbit guide. Tube kept above ~1.5 device pixels: hairline tubes
           break into dashes and crawl/flicker as the system precesses. -->
      <TresMesh :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[p.orbit, 0.02, 6, guideSegments]" />
        <TresMeshBasicMaterial
          :color="themeColors.guide"
          :opacity="0.11"
          :transparent="true"
          :depth-write="false"
        />
      </TresMesh>

      <!-- Planet (position driven per frame) -->
      <TresGroup :ref="el => (planetRefs[i].value = el)" :position="[p.orbit, 0, 0]">
        <!-- Textured smooth sphere on high quality; stylized flat-shaded
             solid colour on low/minimal. -->
        <TresMesh :ref="el => (spinRefs[i].value = el)">
          <TresSphereGeometry :args="[p.size, planetSegments, planetSegments]" />
          <TresMeshStandardMaterial
            :key="planetMaps[i] ? 'tex' : 'flat'"
            :map="planetMaps[i]"
            :color="planetMaps[i] ? '#FFFFFF' : p.color"
            :emissive="p.color"
            :emissive-intensity="planetMaps[i] ? 0.05 : 0.12"
            :roughness="0.55"
            :metalness="planetMaps[i] ? 0.1 : 0.25"
            :flat-shading="!planetMaps[i]"
          />
        </TresMesh>

        <!-- Saturn-like ring -->
        <TresMesh v-if="p.hasRing" :rotation="[Math.PI / 2 - 0.35, 0, 0]">
          <TresRingGeometry :args="[p.size * 1.45, p.size * 2.1, guideSegments]" />
          <TresMeshBasicMaterial
            :key="ringMap ? 'ring-tex' : 'ring-flat'"
            :map="ringMap"
            :color="ringMap ? '#FFFFFF' : '#F9A8D4'"
            :opacity="ringMap ? 0.9 : 0.5"
            :transparent="true"
            :depth-write="false"
            :side="2"
          />
        </TresMesh>

        <!-- Moon on its own pivot -->
        <TresGroup v-if="p.hasMoon" :ref="el => (moonPivotRefs[i].value = el)">
          <TresMesh :position="[p.size + 0.28, 0, 0]">
            <TresSphereGeometry :args="[0.07, planetSegments, planetSegments]" />
            <TresMeshStandardMaterial
              :key="moonMap ? 'moon-tex' : 'moon-flat'"
              :map="moonMap"
              :color="moonMap ? '#FFFFFF' : '#CBD5E1'"
              :emissive="'#CBD5E1'"
              :emissive-intensity="moonMap ? 0.04 : 0.1"
              :roughness="0.7"
              :flat-shading="!moonMap"
            />
          </TresMesh>
        </TresGroup>
      </TresGroup>
    </TresGroup>

    <!-- Asteroid belt (single Points draw call) -->
    <primitive v-if="belt" :object="belt" />
  </TresGroup>

  <!-- Distant starfield (single Points draw call) -->
  <primitive v-if="starField" :object="starField" />
</template>
