<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { resumeData } from '@domain/data/resume'
import { createParticleField, disposeParticleField, type ParticleFieldOptions } from '../utils/particleField'
import type { Points } from 'three'

const props = defineProps<{
  quality: QualityLevel
}>()

// "The Orbital Skill Tree" — a central faceted core with three concentric,
// differently-tilted orbit rings, one per skill category (soft / IA / hard).
// Each skill rides its category ring as a small emissive octahedron gem that
// self-rotates and gently pulses. The strict ring grouping and colour-coding
// reads as an orderly taxonomy, distinct from Hero's free elliptical swarm.
const themeColors = {
  core: '#42B883',
  dust: '#42B883'
}

// One config per category ring: colour, base radius, vertical lift, orbital
// speed (signed → alternating spin direction) and tilt of the ring plane.
const categoryConfig: Record<
  string,
  { color: string; radius: number; yOffset: number; speed: number; tilt: number }
> = {
  soft: { color: '#FFD93D', radius: 1.6, yOffset: 0.55, speed: 0.22, tilt: 0.35 },
  ia: { color: '#10B981', radius: 2.5, yOffset: 0.0, speed: -0.16, tilt: -0.22 },
  hardskills: { color: '#42B883', radius: 3.4, yOffset: -0.55, speed: 0.12, tilt: 0.18 }
}

const categoryOrder = ['soft', 'ia', 'hardskills'] as const

// Static, NON-reactive per-node params, computed once from resume data. The
// old scene kept a `reactive` nodeStates array and called Vue reactivity every
// frame for every node; here positions are mutated directly on the meshes.
interface NodeParam {
  id: string
  color: string
  radius: number
  baseAngle: number
  speed: number
  spin: number // self-rotation rate
  phase: number // pulse phase offset
}

const nodeParams: NodeParam[] = (() => {
  const byCategory: Record<string, typeof resumeData.skills> = {
    soft: [],
    ia: [],
    hardskills: []
  }
  for (const skill of resumeData.skills) {
    if (byCategory[skill.category]) byCategory[skill.category].push(skill)
  }
  const params: NodeParam[] = []
  for (const category of categoryOrder) {
    const cfg = categoryConfig[category]
    const skills = byCategory[category]
    skills.forEach((skill, i) => {
      params.push({
        id: skill.id,
        color: cfg.color,
        radius: cfg.radius,
        baseAngle: (i / skills.length) * Math.PI * 2,
        speed: cfg.speed,
        spin: 0.4 + (i % 3) * 0.15,
        phase: i * 0.7
      })
    })
  }
  return params
})()

// Plain array of template refs (mirrors HeroScene's nodeRefs) — no reactivity
// per node, just direct mesh handles we mutate in `update`.
const nodeRefs = nodeParams.map(() => ref())

const coreRef = ref()
const shellRef = ref()

const isMinimal = computed(() => props.quality === 'minimal')

// Geometry detail scales with quality, capped per the perf budget.
const coreSegments = computed(() => (props.quality === 'high' ? 32 : props.quality === 'low' ? 16 : 8))
const ringSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// Guide-ring descriptors for the template (static).
const guideRings = categoryOrder.map((id) => ({
  id,
  color: categoryConfig[id].color,
  radius: categoryConfig[id].radius,
  yOffset: categoryConfig[id].yOffset,
  tilt: categoryConfig[id].tilt
}))

// Subtle background dust (single Points draw call).
const dust = shallowRef<Points | null>(null)
const buildDust = () => {
  disposeParticleField(dust.value)
  dust.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 400 : 120
  const opts: ParticleFieldOptions = {
    count,
    color: themeColors.dust,
    size: props.quality === 'high' ? 0.03 : 0.05,
    opacity: 0.4,
    additive: true,
    position: (_i, out) => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 7 + Math.random() * 12
      out[0] = r * Math.sin(phi) * Math.cos(theta)
      out[1] = r * Math.sin(phi) * Math.sin(theta)
      out[2] = r * Math.cos(phi)
    }
  }
  dust.value = createParticleField(opts)
}

watch(() => props.quality, buildDust, { immediate: true })

// Reused scratch for orbit math — no per-frame allocations.
const scratch = { x: 0, z: 0 }

const update = (elapsed: number) => {
  // Advance each skill gem along its category ring (in the ring's local plane).
  for (let i = 0; i < nodeRefs.length; i++) {
    const obj = nodeRefs[i].value
    if (!obj) continue
    const p = nodeParams[i]
    const angle = p.baseAngle + elapsed * p.speed
    scratch.x = Math.cos(angle) * p.radius
    scratch.z = Math.sin(angle) * p.radius
    // Local y stays 0: the ring group already carries the lift + tilt, which
    // keeps every gem exactly on its (identically transformed) guide ring.
    obj.position.set(scratch.x, 0, scratch.z)
    obj.rotation.y = elapsed * p.spin
    obj.rotation.x = elapsed * p.spin * 0.5
    const s = 1 + Math.sin(elapsed * 1.4 + p.phase) * 0.18
    obj.scale.setScalar(s)
  }

  // Faceted core: slow tumble + breathing pulse (matches Hero's language).
  if (coreRef.value) {
    coreRef.value.rotation.y = elapsed * 0.18
    coreRef.value.rotation.x = Math.sin(elapsed * 0.15) * 0.1
    const pulse = 1 + Math.sin(elapsed * 1.1) * 0.08
    coreRef.value.scale.setScalar(pulse)
  }
  if (shellRef.value) {
    shellRef.value.rotation.y = -elapsed * 0.12
  }

  if (dust.value) dust.value.rotation.y = elapsed * 0.01
}

useSceneAnimation('skills', update, () => {
  disposeParticleField(dust.value)
})

onBeforeUnmount(() => {
  disposeParticleField(dust.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[4, 3, 6]" :look-at="[0, 0, 0]" />

  <!-- 3-light rig -->
  <TresAmbientLight :intensity="0.4" />
  <TresPointLight :position="[0, 0, 2]" :intensity="2.2" :color="themeColors.core" :distance="14" />
  <TresPointLight :position="[5, 4, -3]" :intensity="0.8" color="#FFD93D" :distance="18" />

  <!-- Central faceted core + a single glow shell (like Hero) -->
  <TresGroup ref="coreRef">
    <TresMesh>
      <TresIcosahedronGeometry :args="[0.7, 1]" />
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
      <TresIcosahedronGeometry :args="[1.0, coreSegments > 16 ? 1 : 0]" />
      <TresMeshBasicMaterial
        :color="themeColors.core"
        :opacity="0.12"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- Thin guide ring per category (single torus each, depthWrite off) -->
  <TresMesh
    v-for="ring in guideRings"
    :key="`guide-${ring.id}`"
    :position="[0, ring.yOffset, 0]"
    :rotation="[Math.PI / 2 + ring.tilt, 0, 0]"
  >
    <TresTorusGeometry :args="[ring.radius, 0.008, 6, ringSegments]" />
    <TresMeshBasicMaterial :color="ring.color" :opacity="0.22" :transparent="true" :depth-write="false" />
  </TresMesh>

  <!-- Skill gems: one lifted+tilted group per category ring (same transform as
       the guide ring above), gems mutated directly -->
  <TresGroup
    v-for="category in categoryOrder"
    :key="`ring-${category}`"
    :position="[0, categoryConfig[category].yOffset, 0]"
    :rotation="[categoryConfig[category].tilt, 0, 0]"
  >
    <template v-for="(param, i) in nodeParams" :key="param.id">
      <TresMesh v-if="param.radius === categoryConfig[category].radius" :ref="(el: unknown) => (nodeRefs[i].value = el)">
        <TresOctahedronGeometry :args="[0.16, 0]" />
        <TresMeshStandardMaterial
          :color="param.color"
          :emissive="param.color"
          :emissive-intensity="0.7"
          :roughness="0.25"
          :metalness="0.6"
          :flat-shading="true"
        />
      </TresMesh>
    </template>
  </TresGroup>

  <!-- Background dust (single draw call) -->
  <primitive v-if="dust" :object="dust" />
</template>
