<script setup lang="ts">
import { computed, shallowRef, triggerRef, watch, onBeforeUnmount } from 'vue'
import {
  BufferGeometry,
  BufferAttribute,
  LineSegments,
  LineBasicMaterial,
  Points,
  PointsMaterial,
  Color,
  AdditiveBlending
} from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

// ── "Circuit Constellations" — Open Source Gallery ───────────────────────────
// Sparse, luminous neon line-networks that grow outward from a seed, hold, then
// gracefully dissolve and regrow in a new colour. Each constellation reads as a
// project branching from open-source roots: calm, intentional, additive glow —
// not a dense generative thicket.
//
// Perf model:
//  - Each constellation = ONE LineSegments draw call (additive, depthWrite:false)
//    + ONE junction Points draw call. Vertices generated once on (re)build.
//  - Growth/hold/dissolve animate only geometry.setDrawRange + material.opacity.
//  - Geometry is rebuilt ONLY on quality change and on dissolve→regrow.
//  - One shared ambient dust Points field, animated by rotation only.
//  - No per-frame heap allocations in update().

const props = defineProps<{
  quality: QualityLevel
}>()

// ── Palette ──────────────────────────────────────────────────────────────────

const PALETTES = [
  { base: new Color('#7C3AED'), tip: new Color('#C4B5FD') }, // violet
  { base: new Color('#22D3EE'), tip: new Color('#A5F3FC') }, // cyan
  { base: new Color('#6366F1'), tip: new Color('#C7D2FE') }, // indigo
  { base: new Color('#EC4899'), tip: new Color('#FBCFE8') }  // magenta
]

// ── Lifecycle phases ─────────────────────────────────────────────────────────

const enum Phase {
  GROWING = 0,
  HOLDING = 1,
  DISSOLVING = 2
}

const GROW_DURATION = 2.6
const HOLD_DURATION = 3.4
const DISSOLVE_DURATION = 1.8
const CYCLE = GROW_DURATION + HOLD_DURATION + DISSOLVE_DURATION

// Generation bounds. Branch factor 2 keeps each constellation sparse and caps
// total branches well under 40 at high quality (1+2+4+8+16 = 31).
const BRANCH_FACTOR = 2
const BASE_LENGTH = 1.9
const LENGTH_DECAY = 0.66
const ANGLE_SPREAD = 0.65
const DIRECTION_NOISE = 0.22

// ── Quality settings ─────────────────────────────────────────────────────────

interface QualitySettings {
  structures: number
  maxDepth: number
  particles: number
  junctions: boolean
}

function getQualitySettings(q: QualityLevel): QualitySettings {
  switch (q) {
    case 'high':    return { structures: 2, maxDepth: 4, particles: 220, junctions: true }
    case 'low':     return { structures: 1, maxDepth: 3, particles: 90, junctions: true }
    case 'minimal': return { structures: 1, maxDepth: 2, particles: 0, junctions: false }
  }
}

const isMinimal = computed(() => props.quality === 'minimal')

// ── Structure model ──────────────────────────────────────────────────────────

interface Structure {
  lines: LineSegments
  /** Single Points field of junction glpoints (one per branch end), or null */
  junctions: Points | null
  /** Total line segments in this constellation */
  segmentCount: number
  phase: Phase
  phaseTime: number
  /** Per-instance shimmer offset to desync constellations */
  shimmerSeed: number
}

const structures = shallowRef<Structure[]>([])
const ambientDust = shallowRef<Points | null>(null)

let paletteCounter = 0

// ── Branch generation (allocates only at build time) ─────────────────────────

// Scratch vectors reused during generation (build-time only, never per frame).
const tmpStart = new Float32Array(3)
const tmpDir = new Float32Array(3)
const tmpPerp = new Float32Array(3)
const tmpPerp2 = new Float32Array(3)

function normalize3(v: Float32Array) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1
  v[0] /= len; v[1] /= len; v[2] /= len
}

function cross3(out: Float32Array, a: Float32Array, b: Float32Array) {
  const ax = a[0], ay = a[1], az = a[2]
  const bx = b[0], by = b[1], bz = b[2]
  out[0] = ay * bz - az * by
  out[1] = az * bx - ax * bz
  out[2] = ax * by - ay * bx
}

/**
 * Recursively writes branch line segments into `positions`/`colors`.
 * Returns the next free segment index. Build-time only.
 */
function growBranch(
  positions: Float32Array,
  colors: Float32Array,
  segIndex: number,
  sx: number, sy: number, sz: number,
  dx: number, dy: number, dz: number,
  depth: number,
  maxDepth: number,
  base: Color,
  tip: Color
): number {
  const length = BASE_LENGTH * Math.pow(LENGTH_DECAY, depth)
  const ex = sx + dx * length
  const ey = sy + dy * length
  const ez = sz + dz * length

  const o = segIndex * 6
  positions[o] = sx; positions[o + 1] = sy; positions[o + 2] = sz
  positions[o + 3] = ex; positions[o + 4] = ey; positions[o + 5] = ez

  // Colour fades from root (base) toward tip with depth.
  const t = maxDepth > 0 ? depth / maxDepth : 0
  const r0 = base.r + (tip.r - base.r) * t
  const g0 = base.g + (tip.g - base.g) * t
  const b0 = base.b + (tip.b - base.b) * t
  const t2 = Math.min(1, t + 0.18)
  const r1 = base.r + (tip.r - base.r) * t2
  const g1 = base.g + (tip.g - base.g) * t2
  const b1 = base.b + (tip.b - base.b) * t2
  colors[o] = r0; colors[o + 1] = g0; colors[o + 2] = b0
  colors[o + 3] = r1; colors[o + 4] = g1; colors[o + 5] = b1

  segIndex += 1

  if (depth < maxDepth) {
    // Build an orthonormal-ish frame around the parent direction.
    tmpDir[0] = dx; tmpDir[1] = dy; tmpDir[2] = dz
    if (Math.abs(dy) < 0.9) { tmpPerp[0] = 0; tmpPerp[1] = 1; tmpPerp[2] = 0 }
    else { tmpPerp[0] = 1; tmpPerp[1] = 0; tmpPerp[2] = 0 }
    cross3(tmpPerp2, tmpDir, tmpPerp)
    normalize3(tmpPerp2)
    cross3(tmpPerp, tmpDir, tmpPerp2)
    normalize3(tmpPerp)

    for (let i = 0; i < BRANCH_FACTOR; i++) {
      const angle = (Math.random() - 0.5) * 2 * ANGLE_SPREAD
      const tilt = (Math.random() - 0.5) * 2 * ANGLE_SPREAD
      const sa = Math.sin(angle) * 0.8
      const st = Math.sin(tilt) * 0.8
      let cx = dx * 0.6 + tmpPerp[0] * sa + tmpPerp2[0] * st + (Math.random() - 0.5) * DIRECTION_NOISE
      let cy = dy * 0.6 + tmpPerp[1] * sa + tmpPerp2[1] * st + (Math.random() - 0.5) * DIRECTION_NOISE
      let cz = dz * 0.6 + tmpPerp[2] * sa + tmpPerp2[2] * st + (Math.random() - 0.5) * DIRECTION_NOISE
      const len = Math.hypot(cx, cy, cz) || 1
      cx /= len; cy /= len; cz /= len
      segIndex = growBranch(
        positions, colors, segIndex,
        ex, ey, ez, cx, cy, cz,
        depth + 1, maxDepth, base, tip
      )
    }
  }

  return segIndex
}

/** Geometric upper bound on segment count for a given depth. */
function maxSegments(maxDepth: number): number {
  let total = 0
  let level = 1
  for (let d = 0; d <= maxDepth; d++) {
    total += level
    level *= BRANCH_FACTOR
  }
  return total
}

// ── Structure construction ───────────────────────────────────────────────────

function spawnStructure(qs: QualitySettings): Structure {
  const palette = PALETTES[paletteCounter++ % PALETTES.length]
  const base = palette.base
  const tip = palette.tip

  const cap = maxSegments(qs.maxDepth)
  const positions = new Float32Array(cap * 6)
  const colors = new Float32Array(cap * 6)

  // Seed somewhere in a calm spread; initial direction biased gently outward.
  const seedX = (Math.random() - 0.5) * 6
  const seedY = (Math.random() - 0.5) * 3.5
  const seedZ = (Math.random() - 0.5) * 2.5
  tmpStart[0] = (Math.random() - 0.5) * 0.6
  tmpStart[1] = 0.35 + Math.random() * 0.4
  tmpStart[2] = (Math.random() - 0.5) * 0.6
  normalize3(tmpStart)

  const segmentCount = growBranch(
    positions, colors, 0,
    seedX, seedY, seedZ,
    tmpStart[0], tmpStart[1], tmpStart[2],
    0, qs.maxDepth, base, tip
  )

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  geometry.setDrawRange(0, 0) // start hidden; growth reveals via drawRange

  const material = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: AdditiveBlending,
    depthWrite: false
  })

  const lines = new LineSegments(geometry, material)

  // Junctions: a SINGLE Points field at every branch end (the odd vertex of
  // each segment). One draw call for all glints in the constellation.
  let junctions: Points | null = null
  if (qs.junctions) {
    junctions = createParticleField({
      count: segmentCount,
      color: tip.getHex(),
      size: 0.07,
      opacity: 0.0,
      additive: true,
      position: (i, out) => {
        const o = i * 6 + 3 // end vertex of segment i
        out[0] = positions[o]
        out[1] = positions[o + 1]
        out[2] = positions[o + 2]
      }
    })
  }

  return {
    lines,
    junctions,
    segmentCount,
    phase: Phase.GROWING,
    phaseTime: 0,
    shimmerSeed: Math.random() * Math.PI * 2
  }
}

function disposeStructure(s: Structure) {
  s.lines.geometry.dispose()
  ;(s.lines.material as LineBasicMaterial).dispose()
  disposeParticleField(s.junctions)
  s.junctions = null
}

// ── (Re)build all structures + dust on quality change ────────────────────────

function rebuild() {
  // Tear down any existing structures.
  for (const s of structures.value) disposeStructure(s)

  disposeParticleField(ambientDust.value)
  ambientDust.value = null

  const qs = getQualitySettings(props.quality)

  const next: Structure[] = []
  for (let i = 0; i < qs.structures; i++) {
    const s = spawnStructure(qs)
    // Stagger initial phases so the scene is never empty and never fully synced.
    const offset = (i / qs.structures) * CYCLE
    if (offset < GROW_DURATION) {
      s.phase = Phase.GROWING
      s.phaseTime = offset
    } else if (offset < GROW_DURATION + HOLD_DURATION) {
      s.phase = Phase.HOLDING
      s.phaseTime = offset - GROW_DURATION
      s.lines.geometry.setDrawRange(0, s.segmentCount * 2)
    } else {
      s.phase = Phase.DISSOLVING
      s.phaseTime = offset - GROW_DURATION - HOLD_DURATION
    }
    next.push(s)
  }
  structures.value = next

  if (qs.particles > 0) {
    ambientDust.value = createParticleField({
      count: qs.particles,
      color: 0x8b5cf6,
      size: 0.035,
      opacity: 0.3,
      additive: true,
      position: (_i, out) => {
        out[0] = (Math.random() - 0.5) * 13
        out[1] = (Math.random() - 0.5) * 8
        out[2] = (Math.random() - 0.5) * 6
      }
    })
  }
}

watch(() => props.quality, rebuild, { immediate: true })

// ── Easing ───────────────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - (1 - t) * (1 - t) * (1 - t)
}

// ── Per-frame update (no heap allocations) ───────────────────────────────────

const update = (elapsed: number, deltaMs: number) => {
  const delta = deltaMs / 1000

  const list = structures.value
  for (let i = 0; i < list.length; i++) {
    const s = list[i]
    s.phaseTime += delta
    const total = s.segmentCount
    const mat = s.lines.material as LineBasicMaterial

    if (s.phase === Phase.GROWING) {
      const p = Math.min(1, s.phaseTime / GROW_DURATION)
      const eased = easeOutCubic(p)
      const visible = Math.floor(eased * total)
      s.lines.geometry.setDrawRange(0, visible * 2)
      mat.opacity = 0.9
      if (s.junctions) {
        // Glints brighten as the network completes.
        ;(s.junctions.material as PointsMaterial).opacity = eased * 0.7
      }
      if (p >= 1) { s.phase = Phase.HOLDING; s.phaseTime = 0 }

    } else if (s.phase === Phase.HOLDING) {
      s.lines.geometry.setDrawRange(0, total * 2)
      const shimmer = 0.82 + Math.sin(elapsed * 2.4 + s.shimmerSeed) * 0.16
      mat.opacity = shimmer
      if (s.junctions) {
        ;(s.junctions.material as PointsMaterial).opacity =
          0.55 + Math.sin(elapsed * 2.0 + s.shimmerSeed) * 0.2
      }
      if (s.phaseTime >= HOLD_DURATION) { s.phase = Phase.DISSOLVING; s.phaseTime = 0 }

    } else { // DISSOLVING — fade tips first by shrinking the draw range
      const p = Math.min(1, s.phaseTime / DISSOLVE_DURATION)
      const eased = easeOutCubic(p)
      const visible = Math.floor((1 - eased) * total)
      s.lines.geometry.setDrawRange(0, visible * 2)
      mat.opacity = (1 - eased) * 0.9
      if (s.junctions) {
        ;(s.junctions.material as PointsMaterial).opacity = (1 - eased) * 0.5
      }
      if (p >= 1) {
        // Regrow: dispose this constellation, spawn a fresh one (new colour).
        // Replacing the element in a shallowRef array does NOT auto-trigger
        // reactivity, so the <primitive> v-for would keep rendering the old
        // (now-disposed) object and the constellation would vanish forever.
        // triggerRef forces the swap into the scene graph. This fires once per
        // dissolve cycle (~7.8s), not per frame, so the cost is negligible.
        const qs = getQualitySettings(props.quality)
        disposeStructure(s)
        list[i] = spawnStructure(qs)
        triggerRef(structures)
      }
    }

    // Gentle drift so constellations feel alive without per-vertex work.
    s.lines.rotation.y = Math.sin(elapsed * 0.05 + s.shimmerSeed) * 0.08
    if (s.junctions) s.junctions.rotation.y = s.lines.rotation.y
  }

  if (ambientDust.value) {
    ambientDust.value.rotation.y = elapsed * 0.018
    ambientDust.value.rotation.x = Math.sin(elapsed * 0.025) * 0.04
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

const cleanup = () => {
  for (const s of structures.value) disposeStructure(s)
  structures.value = []
  disposeParticleField(ambientDust.value)
  ambientDust.value = null
}

useSceneAnimation('projects', update, cleanup)

onBeforeUnmount(() => {
  disposeParticleField(ambientDust.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />

  <!-- Self-lit additive scene: at most 2 lights -->
  <TresAmbientLight :intensity="0.18" />
  <TresPointLight v-if="!isMinimal" :position="[0, 3, 5]" :intensity="0.4" color="#7C3AED" :distance="20" />

  <!-- Constellations + their junction glints (one draw call each) -->
  <template v-for="(s, i) in structures" :key="i">
    <primitive :object="s.lines" />
    <primitive v-if="s.junctions" :object="s.junctions" />
  </template>

  <!-- Ambient dust (single Points draw call) -->
  <primitive v-if="ambientDust" :object="ambientDust" />
</template>
