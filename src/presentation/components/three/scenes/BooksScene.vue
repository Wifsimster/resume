<script setup lang="ts">
import { ref, computed, shallowRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { Points, type CanvasTexture } from 'three'
import { useTres } from '@tresjs/core'
import type { QualityLevel } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'
import { createBookCoverTexture } from '../utils/proceduralTextures'

const props = defineProps<{
  quality: QualityLevel
}>()

// ---------------------------------------------------------------------------
// "Reading Nook" — floating shelves of upright books along a gentle corridor,
// warm lamp + candle glow, a slow cinematic camera drift, and a calm field of
// rising motes. Cozy library identity, modernised and tightened for perf:
//   - 4 lights total (1 ambient + 1 warm key + 2 dynamic candles, single sine)
//   - motes are ONE createParticleField Points, animated by translating the
//     whole object (no per-frame BufferAttribute uploads)
//   - per-book breathing mutates mesh refs directly (no reactive arrays)
// ---------------------------------------------------------------------------

// TresJS context — camera access for the manual cinematic drift.
const { camera } = useTres()

// ---------------------------------------------------------------------------
// Warm palette — one per book index, cycling. Read status keeps its meaning:
// 'read' books get a soft glow + brighter emissive; others stay quietly lit.
// ---------------------------------------------------------------------------
const bookPalette = [
  { cover: '#3B4A6B', spine: '#27314A', emissive: '#7FA8FF' },
  { cover: '#8A4B2C', spine: '#5C2F18', emissive: '#FFB070' },
  { cover: '#2E3A8C', spine: '#1B2356', emissive: '#8E9BFF' },
  { cover: '#5A3A7A', spine: '#372149', emissive: '#C49BFF' },
  { cover: '#2F6B3A', spine: '#1B3F23', emissive: '#86E0A0' },
  { cover: '#9A3636', spine: '#5F1F1F', emissive: '#FF9090' },
  { cover: '#B8702A', spine: '#7A4717', emissive: '#FFCC7A' },
  { cover: '#2A6F9A', spine: '#17435F', emissive: '#7FD0FF' },
  { cover: '#6B4A3A', spine: '#3F2A20', emissive: '#D8A98C' },
  { cover: '#3A4750', spine: '#222B30', emissive: '#A8C0CC' },
]

const theme = {
  ambient: '#5A4A3A',
  key: '#FFE3B3',
  candleA: '#FFD194',
  candleB: '#FFC978',
}

// ---------------------------------------------------------------------------
// Corridor constants
// ---------------------------------------------------------------------------
const WALL_X = 2.5
const SHELF_LEVELS = [0.5, 1.8]
const CORRIDOR_Z_MIN = -12
const CORRIDOR_Z_MAX = 2
const CORRIDOR_DEPTH = CORRIDOR_Z_MAX - CORRIDOR_Z_MIN

// Cinematic camera drift parameters
const CAM_Z_CENTER = -5
const CAM_Z_AMP = 4
const CAM_Z_FREQ = 0.08
const CAM_Y_CENTER = 1.2
const CAM_Y_AMP = 0.3
const CAM_Y_FREQ = 0.15
const CAM_X_AMP = 0.15
const CAM_X_FREQ = 0.12
const CAM_LOOK_AHEAD = 1.5

// Two warm candle/lamp glows, each driven by a SINGLE sine.
const CANDLE_POSITIONS: [number, number, number][] = [
  [0, 2.8, -3],
  [0, 2.8, -9],
]
const CANDLE_PARAMS = [
  { color: theme.candleA, base: 1.3, freq: 3.0, phase: 0.0, amp: 0.25 },
  { color: theme.candleB, base: 1.1, freq: 2.6, phase: 1.7, amp: 0.22 },
]

// ---------------------------------------------------------------------------
// Quality-gated computeds
// ---------------------------------------------------------------------------
const isMinimal = computed(() => props.quality === 'minimal')
const isLow = computed(() => props.quality === 'low')
const isHigh = computed(() => props.quality === 'high')

const bookCount = computed(() => (isMinimal.value ? 4 : isLow.value ? 6 : 8))
// Motes capped well under budget: <=200 high / <=80 low, 0 on minimal.
const moteCount = computed(() => (isMinimal.value ? 0 : isLow.value ? 80 : 200))
// Candle lights: minimal uses none (key light carries it), low 1, high 2 — at
// most 2 dynamic lights so the rig stays at 4 total (ambient + key + 2).
const candleCount = computed(() => (isMinimal.value ? 0 : isLow.value ? 1 : 2))
// Radial segments for spine cylinders: <=16 high / <=8 low.
const spineSegments = computed(() => (isMinimal.value ? 6 : isLow.value ? 8 : 16))
const fogDensity = computed(() => (isMinimal.value ? 0 : isLow.value ? 0.035 : 0.05))

// Shelf material properties
const shelfOpacity = computed(() => (isMinimal.value ? 1.0 : isLow.value ? 0.6 : 0.4))
const shelfColor = computed(() => (isMinimal.value ? '#2A2A3A' : '#6A5A48'))
const shelfMetalness = computed(() => (isMinimal.value ? 0.0 : 0.3))
const shelfRoughness = computed(() => (isMinimal.value ? 0.8 : 0.4))

// ---------------------------------------------------------------------------
// Book layout — distribute across 4 shelf quadrants
// ---------------------------------------------------------------------------
interface BookPlacement {
  id: string
  title: string
  author: string
  status: string
  index: number
  colors: { cover: string; spine: string; emissive: string }
  isRead: boolean
  showGlow: boolean
  position: [number, number, number]
  rotationY: number
  // Per-book breathing animation params (consumed directly in update())
  breathFreq: number
  breathPhase: number
  wobbleFreq: number
  wobblePhase: number
}

const visibleBooks = computed<BookPlacement[]>(() => {
  const count = bookCount.value
  const books = resumeData.books.slice(0, count)

  const quadrants: { wallX: number; shelfY: number; faceDir: number }[] = [
    { wallX: -WALL_X, shelfY: SHELF_LEVELS[0], faceDir: 1 },
    { wallX: -WALL_X, shelfY: SHELF_LEVELS[1], faceDir: 1 },
    { wallX: WALL_X, shelfY: SHELF_LEVELS[0], faceDir: -1 },
    { wallX: WALL_X, shelfY: SHELF_LEVELS[1], faceDir: -1 },
  ]

  return books.map((book, i) => {
    const colors = bookPalette[i % bookPalette.length]
    const quad = quadrants[i % quadrants.length]

    const booksInQuad = Math.ceil(count / quadrants.length)
    const indexInQuad = Math.floor(i / quadrants.length)
    const zSpacing = CORRIDOR_DEPTH / (booksInQuad + 1)
    const z = CORRIDOR_Z_MIN + zSpacing * (indexInQuad + 1)

    const x = quad.wallX + quad.faceDir * 0.3
    const y = quad.shelfY + 0.58
    const isRead = book.status === 'read'

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      index: i,
      colors,
      isRead,
      // One glow layer max, only for read books on high quality.
      showGlow: isHigh.value && isRead,
      position: [x, y, z] as [number, number, number],
      rotationY: quad.faceDir > 0 ? Math.PI * 0.15 : -Math.PI * 0.15,
      breathFreq: 0.4 + i * 0.07,
      breathPhase: i * 1.3,
      wobbleFreq: 0.3 + i * 0.05,
      wobblePhase: i * 0.9,
    }
  })
})

// ---------------------------------------------------------------------------
// Shelf definitions — 4 floating shelves
// ---------------------------------------------------------------------------
const shelves = computed(() => {
  const shelfWidth = 4.0
  const shelfDepth = CORRIDOR_DEPTH * 0.85
  const shelfThickness = 0.05
  const zCenter = (CORRIDOR_Z_MIN + CORRIDOR_Z_MAX) / 2

  return [
    { pos: [-WALL_X + 0.3, SHELF_LEVELS[0], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
    { pos: [-WALL_X + 0.3, SHELF_LEVELS[1], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
    { pos: [WALL_X - 0.3, SHELF_LEVELS[0], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
    { pos: [WALL_X - 0.3, SHELF_LEVELS[1], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
  ]
})

// ---------------------------------------------------------------------------
// Per-book group refs (mutated directly in update — no reactive per-frame data)
// ---------------------------------------------------------------------------
const bookRefs = resumeData.books.map(() => ref())

// Candle light refs — flicker mutates `intensity` directly on the Three light
// each frame instead of routing every frame through Vue reactivity.
const candleRefs = CANDLE_PARAMS.map(() => ref())

// ---------------------------------------------------------------------------
// Procedural book cover textures — one per palette entry, generated once on
// high quality (border frame, title/author bars, emblem). Low/minimal keep
// plain coloured covers.
// ---------------------------------------------------------------------------
const coverMaps = shallowRef<(CanvasTexture | null)[]>(bookPalette.map(() => null))

const buildCovers = () => {
  const previous = coverMaps.value.filter((t): t is CanvasTexture => t !== null)
  if (isHigh.value) {
    coverMaps.value = bookPalette.map((p, i) =>
      createBookCoverTexture(p.cover, p.emissive, i + 1)
    )
  } else {
    coverMaps.value = bookPalette.map(() => null)
  }
  // Dispose old GPU textures only after Vue re-patched the materials.
  if (previous.length > 0) {
    nextTick(() => {
      for (const t of previous) t.dispose()
    })
  }
}

const disposeCovers = () => {
  for (const t of coverMaps.value) t?.dispose()
  coverMaps.value = bookPalette.map(() => null)
}

// ---------------------------------------------------------------------------
// Rising motes — ONE createParticleField Points. Animated purely by slowly
// translating/rotating the whole object: NO per-frame buffer mutation.
// ---------------------------------------------------------------------------
const motes = shallowRef<Points | null>(null)
const MOTE_Y_SPAN = 4.0

const buildMotes = () => {
  disposeParticleField(motes.value)
  motes.value = null
  if (isMinimal.value) return

  const count = moteCount.value
  if (count === 0) return

  motes.value = createParticleField({
    count,
    color: 0xffd9a0,
    size: isHigh.value ? 0.03 : 0.045,
    opacity: 0.5,
    additive: true,
    position: (_i, out) => {
      out[0] = (Math.random() - 0.5) * (WALL_X * 2 - 0.5)
      out[1] = Math.random() * MOTE_Y_SPAN
      out[2] = CORRIDOR_Z_MIN + Math.random() * CORRIDOR_DEPTH
    },
  })
}

const rebuild = () => {
  buildMotes()
  buildCovers()
}
watch(() => props.quality, rebuild, { immediate: true })

// ---------------------------------------------------------------------------
// Main animation loop — uses controller elapsed/delta, never Date.now().
// Scratch values reused; no per-frame heap allocations.
// ---------------------------------------------------------------------------
const update = (elapsed: number) => {
  // 1. Cinematic camera drift
  const cam = camera.value
  if (cam) {
    const cx = Math.sin(elapsed * CAM_X_FREQ) * CAM_X_AMP
    const cy = CAM_Y_CENTER + Math.sin(elapsed * CAM_Y_FREQ) * CAM_Y_AMP
    const cz = CAM_Z_CENTER + Math.sin(elapsed * CAM_Z_FREQ) * CAM_Z_AMP
    cam.position.set(cx, cy, cz)
    cam.lookAt(cx * 0.5, cy - 0.1, cz - CAM_LOOK_AHEAD)
  }

  // 2. Candle flicker — a SINGLE sine per dynamic light, mutated directly
  const cCount = candleCount.value
  for (let i = 0; i < cCount; i++) {
    const light = candleRefs[i].value
    if (!light) continue
    const p = CANDLE_PARAMS[i]
    light.intensity = p.base + Math.sin(elapsed * p.freq + p.phase) * p.amp
  }

  // 3. Per-book breathing — mutate group refs directly
  const bCount = bookCount.value
  for (let i = 0; i < bCount; i++) {
    const obj = bookRefs[i].value
    const book = visibleBooks.value[i]
    if (!obj || !book) continue
    obj.position.y = book.position[1] + Math.sin(elapsed * book.breathFreq + book.breathPhase) * 0.015
    obj.rotation.y = book.rotationY + Math.sin(elapsed * book.wobbleFreq + book.wobblePhase) * 0.02
  }

  // 4. Rising motes — translate the whole Points object only (no buffer upload).
  //    A slow upward crawl that wraps within the mote Y span, plus a gentle sway.
  const m = motes.value
  if (m) {
    const y = (elapsed * 0.12) % MOTE_Y_SPAN
    m.position.y = y
    m.position.x = Math.sin(elapsed * 0.06) * 0.25
    m.rotation.y = elapsed * 0.01
  }
}

useSceneAnimation('books', update, () => {
  disposeParticleField(motes.value)
  disposeCovers()
})

onBeforeUnmount(() => {
  disposeParticleField(motes.value)
})
</script>

<template>
  <!-- Camera at corridor entrance; overridden each frame by the drift. -->
  <TresPerspectiveCamera :position="[0, 1.2, 0]" :fov="65" :near="0.1" :far="50" />

  <!-- Warm haze pulling the corridor into a cozy depth -->
  <TresFogExp2 v-if="fogDensity > 0" :args="['#120D08', fogDensity]" />

  <!-- ================================================================== -->
  <!-- Lighting — 4 total max: ambient + warm key + up to 2 candles        -->
  <!-- ================================================================== -->
  <TresAmbientLight :intensity="0.18" :color="theme.ambient" />

  <!-- Warm key light (the room lamp) — carries minimal tier on its own -->
  <TresPointLight :position="[0, 3.2, -5]" :intensity="1.4" :color="theme.key" :distance="22" :decay="1.5" />

  <!-- Dynamic candle glows (each a single-sine flicker) -->
  <TresPointLight
    v-for="(pos, ci) in CANDLE_POSITIONS.slice(0, candleCount)"
    :key="`candle-${ci}`"
    :ref="el => (candleRefs[ci].value = el)"
    :position="pos"
    :intensity="CANDLE_PARAMS[ci].base"
    :color="CANDLE_PARAMS[ci].color"
    :distance="9"
    :decay="2"
  />

  <!-- ================================================================== -->
  <!-- Floating shelves (4 total)                                          -->
  <!-- ================================================================== -->
  <TresMesh
    v-for="(shelf, si) in shelves"
    :key="`shelf-${si}`"
    :position="shelf.pos"
  >
    <TresBoxGeometry :args="shelf.size" />
    <TresMeshStandardMaterial
      :color="shelfColor"
      :opacity="shelfOpacity"
      :transparent="shelfOpacity < 1"
      :depth-write="shelfOpacity >= 1"
      :metalness="shelfMetalness"
      :roughness="shelfRoughness"
    />
  </TresMesh>

  <!-- ================================================================== -->
  <!-- Books — upright, standing on shelves                                -->
  <!-- ================================================================== -->
  <TresGroup
    v-for="book in visibleBooks"
    :key="book.id"
    :ref="el => (bookRefs[book.index].value = el)"
    :position="book.position"
    :rotation="[0, book.rotationY, 0]"
  >
    <!-- Front Cover (procedural cover art on high quality) -->
    <TresMesh :position="[0, 0, 0.065]">
      <TresBoxGeometry :args="[0.76, 1.08, 0.025]" />
      <TresMeshStandardMaterial
        :key="coverMaps[book.index % bookPalette.length] ? 'cover-tex' : 'cover-flat'"
        :map="coverMaps[book.index % bookPalette.length]"
        :color="coverMaps[book.index % bookPalette.length] ? '#FFFFFF' : book.colors.cover"
        :roughness="0.55"
        :metalness="0.15"
      />
    </TresMesh>

    <!-- Back Cover -->
    <TresMesh :position="[0, 0, -0.065]">
      <TresBoxGeometry :args="[0.76, 1.08, 0.025]" />
      <TresMeshStandardMaterial :color="book.colors.cover" :roughness="0.55" :metalness="0.15" />
    </TresMesh>

    <!-- Spine (half cylinder) -->
    <TresMesh :position="[-0.38, 0, 0]" :rotation="[Math.PI / 2, 0, 0]">
      <TresCylinderGeometry :args="[0.09, 0.09, 1.08, spineSegments, 1, false, 0, Math.PI]" />
      <TresMeshStandardMaterial
        :color="book.colors.spine"
        :emissive="book.colors.emissive"
        :emissive-intensity="book.isRead ? 0.3 : 0.08"
        :roughness="0.5"
        :metalness="0.2"
      />
    </TresMesh>

    <!-- Page Block -->
    <TresMesh :position="[0.02, 0, 0]">
      <TresBoxGeometry :args="[0.68, 1.0, 0.12]" />
      <TresMeshStandardMaterial color="#FFF8E7" :roughness="0.9" :metalness="0.0" />
    </TresMesh>

    <!-- Page Edges -->
    <TresMesh :position="[0.02, 0.505, 0]">
      <TresBoxGeometry :args="[0.68, 0.01, 0.12]" />
      <TresMeshStandardMaterial color="#E8DCC8" :roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[0.02, -0.505, 0]">
      <TresBoxGeometry :args="[0.68, 0.01, 0.12]" />
      <TresMeshStandardMaterial color="#E8DCC8" :roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[0.365, 0, 0]">
      <TresBoxGeometry :args="[0.01, 1.0, 0.12]" />
      <TresMeshStandardMaterial color="#E8DCC8" :roughness="0.85" />
    </TresMesh>

    <!-- Spine band (one accent, non-minimal) -->
    <TresMesh v-if="!isMinimal" :position="[-0.38, 0, 0]" :rotation="[Math.PI / 2, 0, 0]">
      <TresCylinderGeometry :args="[0.095, 0.095, 0.06, spineSegments, 1, false, 0, Math.PI]" />
      <TresMeshStandardMaterial
        :color="book.colors.emissive"
        :emissive="book.colors.emissive"
        :emissive-intensity="0.4"
        :roughness="0.4"
        :metalness="0.5"
      />
    </TresMesh>

    <!-- Single soft glow shell — read books, high quality only -->
    <TresMesh v-if="book.showGlow">
      <TresSphereGeometry :args="[0.7, 12, 12]" />
      <TresMeshBasicMaterial
        :color="book.colors.emissive"
        :opacity="0.08"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- ================================================================== -->
  <!-- Rising motes (single draw call, translated not re-buffered)         -->
  <!-- ================================================================== -->
  <primitive v-if="motes" :object="motes" />
</template>
