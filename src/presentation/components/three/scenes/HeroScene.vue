<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import { Points } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

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
}

// Orbit radii compressed to the camera frustum; speeds follow Kepler's third
// law (ω ∝ r^-1.5) so inner planets visibly outrun outer ones.
const planets: PlanetDef[] = [
  { color: '#A78BFA', size: 0.13, orbit: 1.6, inclination: 0.06, node: 0.0, phase: 0.0, spin: 0.9 },
  { color: '#F59E0B', size: 0.21, orbit: 2.2, inclination: -0.09, node: 0.6, phase: 2.1, spin: 0.7 },
  { color: '#22D3EE', size: 0.24, orbit: 2.8, inclination: 0.04, node: 1.9, phase: 4.0, spin: 0.8, hasMoon: true },
  { color: '#F97316', size: 0.17, orbit: 3.4, inclination: 0.12, node: 2.8, phase: 1.2, spin: 0.75 },
  { color: '#FBBF24', size: 0.42, orbit: 4.3, inclination: -0.07, node: 4.1, phase: 5.3, spin: 0.5 },
  { color: '#EC4899', size: 0.34, orbit: 5.1, inclination: 0.14, node: 5.0, phase: 3.0, spin: 0.45, hasRing: true },
  { color: '#3B82F6', size: 0.26, orbit: 5.8, inclination: -0.11, node: 0.9, phase: 0.7, spin: 0.6 }
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

// Geometry detail scales with quality. Planets stay low-poly on purpose —
// flat shading over ~16 segments is the stylized look, not a budget cut.
const sunSegments = computed(() => (props.quality === 'high' ? 32 : props.quality === 'low' ? 20 : 12))
const planetSegments = computed(() => (props.quality === 'high' ? 18 : props.quality === 'low' ? 12 : 8))
const guideSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// --- Background starfield (single Points draw call) ---
const starField = shallowRef<Points | null>(null)
const buildStars = () => {
  disposeParticleField(starField.value)
  starField.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 700 : 200
  starField.value = createParticleField({
    count,
    color: 0xffffff,
    size: props.quality === 'high' ? 0.03 : 0.05,
    opacity: 0.55,
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
    size: props.quality === 'high' ? 0.035 : 0.05,
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
      <TresMeshBasicMaterial :color="themeColors.sun" />
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
      <!-- Thin orbit guide -->
      <TresMesh :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[p.orbit, 0.008, 6, guideSegments]" />
        <TresMeshBasicMaterial
          :color="themeColors.guide"
          :opacity="0.14"
          :transparent="true"
          :depth-write="false"
        />
      </TresMesh>

      <!-- Planet (position driven per frame) -->
      <TresGroup :ref="el => (planetRefs[i].value = el)" :position="[p.orbit, 0, 0]">
        <TresMesh :ref="el => (spinRefs[i].value = el)">
          <TresSphereGeometry :args="[p.size, planetSegments, planetSegments]" />
          <TresMeshStandardMaterial
            :color="p.color"
            :emissive="p.color"
            :emissive-intensity="0.12"
            :roughness="0.55"
            :metalness="0.25"
            :flat-shading="true"
          />
        </TresMesh>

        <!-- Saturn-like ring -->
        <TresMesh v-if="p.hasRing" :rotation="[Math.PI / 2 - 0.35, 0, 0]">
          <TresRingGeometry :args="[p.size * 1.45, p.size * 2.1, guideSegments]" />
          <TresMeshBasicMaterial
            :color="'#F9A8D4'"
            :opacity="0.5"
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
              :color="'#CBD5E1'"
              :emissive="'#CBD5E1'"
              :emissive-intensity="0.1"
              :roughness="0.7"
              :flat-shading="true"
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
