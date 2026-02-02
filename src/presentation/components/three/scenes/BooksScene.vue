<script setup lang="ts">
import { ref, computed, shallowRef, triggerRef, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  AdditiveBlending,
  Vector3,
} from 'three'
import { useTres } from '@tresjs/core'
import type { QualityLevel } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'
import { useAnimationController } from '@application/composables/useAnimationController'

const props = defineProps<{
  quality: QualityLevel
}>()

// ---------------------------------------------------------------------------
// Section visibility + animation controller
// ---------------------------------------------------------------------------
const sectionElement = ref<HTMLElement | null>(null)
const animationController = useAnimationController(sectionElement)

// ---------------------------------------------------------------------------
// TresJS context — camera access for manual drift
// ---------------------------------------------------------------------------
const { camera } = useTres()

// ---------------------------------------------------------------------------
// Palette — one per book index, cycling
// ---------------------------------------------------------------------------
const bookPalette = [
  { cover: '#2C3E50', spine: '#1A252F', emissive: '#3498DB' },
  { cover: '#8B4513', spine: '#5C2D0E', emissive: '#D2691E' },
  { cover: '#1A237E', spine: '#0D1242', emissive: '#3949AB' },
  { cover: '#4A148C', spine: '#2E0D57', emissive: '#9C27B0' },
  { cover: '#1B5E20', spine: '#0E3311', emissive: '#4CAF50' },
  { cover: '#B71C1C', spine: '#7A1212', emissive: '#E53935' },
  { cover: '#E65100', spine: '#993600', emissive: '#FF9800' },
  { cover: '#01579B', spine: '#003A66', emissive: '#29B6F6' },
  { cover: '#4E342E', spine: '#2E1F1B', emissive: '#8D6E63' },
  { cover: '#263238', spine: '#141B1F', emissive: '#78909C' },
]

// ---------------------------------------------------------------------------
// Corridor constants
// ---------------------------------------------------------------------------
const WALL_X = 2.5
const SHELF_LEVELS = [0.5, 1.8]
const CORRIDOR_Z_MIN = -12
const CORRIDOR_Z_MAX = 2
const CORRIDOR_DEPTH = CORRIDOR_Z_MAX - CORRIDOR_Z_MIN

// Camera drift parameters
const CAM_Z_CENTER = -5
const CAM_Z_AMP = 4
const CAM_Z_FREQ = 0.08
const CAM_Y_CENTER = 1.2
const CAM_Y_AMP = 0.3
const CAM_Y_FREQ = 0.15
const CAM_X_AMP = 0.15
const CAM_X_FREQ = 0.12
const CAM_LOOK_AHEAD = 1.5

// Candle light configs
const CANDLE_COLORS = ['#FFE4B5', '#FFD194', '#FFDAB9', '#FFC978']
const CANDLE_POSITIONS: [number, number, number][] = [
  [0, 2.8, -2],
  [0, 2.8, -5],
  [0, 2.8, -8],
  [0, 2.8, -11],
]
// Per-candle flicker parameters (phase offsets + frequency multipliers)
const CANDLE_FLICKER_PARAMS = [
  { f1: 3.0, f2: 7.1, f3: 13.0, p1: 0.0, p2: 1.7, p3: 3.2, base: 1.2 },
  { f1: 2.7, f2: 6.3, f3: 11.5, p1: 0.8, p2: 2.5, p3: 0.4, base: 1.0 },
  { f1: 3.3, f2: 8.0, f3: 12.2, p1: 1.5, p2: 0.3, p3: 2.1, base: 1.1 },
  { f1: 2.5, f2: 7.7, f3: 14.0, p1: 2.2, p2: 1.0, p3: 0.9, base: 1.0 },
]

// ---------------------------------------------------------------------------
// Quality-gated computeds
// ---------------------------------------------------------------------------
const isMinimal = computed(() => props.quality === 'minimal')
const isLow = computed(() => props.quality === 'low')
const isHigh = computed(() => props.quality === 'high')

const bookCount = computed(() => isMinimal.value ? 4 : isLow.value ? 6 : 8)
const dustCount = computed(() => isMinimal.value ? 0 : isLow.value ? 100 : 400)
const candleCount = computed(() => isMinimal.value ? 1 : isLow.value ? 2 : 4)
const spineSegments = computed(() => isMinimal.value ? 6 : isLow.value ? 12 : 16)
const fogDensity = computed(() => isMinimal.value ? 0 : isLow.value ? 0.04 : 0.06)
const showMoonlight = computed(() => isHigh.value)
const showGlowSpheres = computed(() => isHigh.value)

// Shelf material properties
const shelfOpacity = computed(() => isMinimal.value ? 1.0 : isLow.value ? 0.6 : 0.35)
const shelfColor = computed(() => isMinimal.value ? '#2A2A3A' : '#4A6A8A')
const shelfMetalness = computed(() => isMinimal.value ? 0.0 : isLow.value ? 0.3 : 0.6)
const shelfRoughness = computed(() => isMinimal.value ? 0.8 : isLow.value ? 0.3 : 0.1)

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
  showGlow: boolean
  position: [number, number, number]
  rotationY: number
  // Per-book breathing animation params
  breathFreq: number
  breathPhase: number
  wobbleFreq: number
  wobblePhase: number
}

const visibleBooks = computed<BookPlacement[]>(() => {
  const count = bookCount.value
  const books = resumeData.books.slice(0, count)

  // 4 quadrants: left-lower, left-upper, right-lower, right-upper
  const quadrants: { wallX: number; shelfY: number; faceDir: number }[] = [
    { wallX: -WALL_X, shelfY: SHELF_LEVELS[0], faceDir: 1 },   // left wall, lower shelf
    { wallX: -WALL_X, shelfY: SHELF_LEVELS[1], faceDir: 1 },   // left wall, upper shelf
    { wallX: WALL_X, shelfY: SHELF_LEVELS[0], faceDir: -1 },  // right wall, lower shelf
    { wallX: WALL_X, shelfY: SHELF_LEVELS[1], faceDir: -1 },  // right wall, upper shelf
  ]

  return books.map((book, i) => {
    const colors = bookPalette[i % bookPalette.length]
    const quad = quadrants[i % quadrants.length]

    // Distribute books along Z within corridor, evenly spaced per quadrant
    const booksInQuad = Math.ceil(count / quadrants.length)
    const indexInQuad = Math.floor(i / quadrants.length)
    const zSpacing = CORRIDOR_DEPTH / (booksInQuad + 1)
    const z = CORRIDOR_Z_MIN + zSpacing * (indexInQuad + 1)

    // X: offset slightly from wall toward center so books sit on shelf edge
    const x = quad.wallX + quad.faceDir * 0.3

    // Y: book center sits above shelf surface (book half-height ~0.54)
    const y = quad.shelfY + 0.58

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      index: i,
      colors,
      showGlow: showGlowSpheres.value && book.status === 'read',
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
// Shelf definitions — 4 floating glass shelves
// ---------------------------------------------------------------------------
const shelves = computed(() => {
  const shelfWidth = 4.0
  const shelfDepth = CORRIDOR_DEPTH * 0.85
  const shelfThickness = 0.05
  const zCenter = (CORRIDOR_Z_MIN + CORRIDOR_Z_MAX) / 2

  return [
    // Left wall shelves
    { pos: [-WALL_X + 0.3, SHELF_LEVELS[0], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
    { pos: [-WALL_X + 0.3, SHELF_LEVELS[1], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
    // Right wall shelves
    { pos: [WALL_X - 0.3, SHELF_LEVELS[0], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
    { pos: [WALL_X - 0.3, SHELF_LEVELS[1], zCenter] as [number, number, number], size: [shelfWidth * 0.4, shelfThickness, shelfDepth] as [number, number, number] },
  ]
})

// ---------------------------------------------------------------------------
// Reactive animation state
// ---------------------------------------------------------------------------
interface BookAnimState {
  dy: number       // breathing Y offset
  dRotY: number    // wobble rotation offset
}

const bookAnimStates = shallowRef<BookAnimState[]>(
  Array.from({ length: resumeData.books.length }, () => ({ dy: 0, dRotY: 0 }))
)

// Candle intensities (reactive for template binding)
const candleIntensities = ref<number[]>([1.2, 1.0, 1.1, 1.0])

// ---------------------------------------------------------------------------
// Dust particle system
// ---------------------------------------------------------------------------
const dustParticles = shallowRef<Points | null>(null)
let dustPositions: Float32Array | null = null
let dustVelocities: { vy: number; wx: number; wz: number; px: number; pz: number }[] = []

const createDustParticles = () => {
  // Dispose existing
  if (dustParticles.value) {
    dustParticles.value.geometry.dispose()
    ;(dustParticles.value.material as PointsMaterial).dispose()
    dustParticles.value = null
    dustPositions = null
    dustVelocities = []
  }

  const count = dustCount.value
  if (count === 0) return

  dustPositions = new Float32Array(count * 3)
  dustVelocities = []

  for (let i = 0; i < count; i++) {
    // Spawn within corridor volume
    dustPositions[i * 3] = (Math.random() - 0.5) * (WALL_X * 2 - 0.5)
    dustPositions[i * 3 + 1] = Math.random() * 3.5
    dustPositions[i * 3 + 2] = CORRIDOR_Z_MIN + Math.random() * CORRIDOR_DEPTH

    dustVelocities.push({
      vy: 0.02 + Math.random() * 0.03,          // upward drift speed
      wx: 0.3 + Math.random() * 0.5,             // X wander frequency
      wz: 0.2 + Math.random() * 0.4,             // Z wander frequency
      px: Math.random() * Math.PI * 2,            // X phase
      pz: Math.random() * Math.PI * 2,            // Z phase
    })
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(dustPositions, 3))

  const mat = new PointsMaterial({
    color: 0xFFD700,
    size: isHigh.value ? 0.03 : 0.045,
    opacity: 0.5,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })

  dustParticles.value = new Points(geo, mat)
}

watch(() => props.quality, createDustParticles)

// ---------------------------------------------------------------------------
// Camera lookAt target (reuse to avoid GC)
// ---------------------------------------------------------------------------
const lookAtTarget = new Vector3()

// ---------------------------------------------------------------------------
// Main animation loop
// ---------------------------------------------------------------------------
const updateAnimations = (elapsed: number, _delta: number) => {
  // 1. Camera drift
  const cam = camera.value
  if (cam) {
    const cx = Math.sin(elapsed * CAM_X_FREQ) * CAM_X_AMP
    const cy = CAM_Y_CENTER + Math.sin(elapsed * CAM_Y_FREQ) * CAM_Y_AMP
    const cz = CAM_Z_CENTER + Math.sin(elapsed * CAM_Z_FREQ) * CAM_Z_AMP

    cam.position.set(cx, cy, cz)

    // Look slightly ahead along corridor
    lookAtTarget.set(cx * 0.5, cy - 0.1, cz - CAM_LOOK_AHEAD)
    cam.lookAt(lookAtTarget)
  }

  // 2. Candle flicker
  const cCount = candleCount.value
  for (let i = 0; i < cCount; i++) {
    const p = CANDLE_FLICKER_PARAMS[i]
    const flicker =
      Math.sin(elapsed * p.f1 + p.p1) * 0.15 +
      Math.sin(elapsed * p.f2 + p.p2) * 0.1 +
      Math.sin(elapsed * p.f3 + p.p3) * 0.05
    candleIntensities.value[i] = Math.max(0.3, p.base + flicker)
  }

  // 3. Book breathing animation
  const bCount = bookCount.value
  for (let i = 0; i < bCount; i++) {
    const state = bookAnimStates.value[i]
    const book = visibleBooks.value[i]
    if (!book || !state) continue

    state.dy = Math.sin(elapsed * book.breathFreq + book.breathPhase) * 0.015
    state.dRotY = Math.sin(elapsed * book.wobbleFreq + book.wobblePhase) * 0.02
  }
  triggerRef(bookAnimStates)

  // 4. Dust particle movement
  if (dustPositions && dustParticles.value) {
    const count = dustCount.value
    const halfX = WALL_X - 0.25
    const maxY = 3.8
    const dt = _delta / 1000 // delta is in ms from RAF

    for (let i = 0; i < count; i++) {
      const v = dustVelocities[i]
      const i3 = i * 3

      // Upward drift
      dustPositions[i3 + 1] += v.vy * dt * 30

      // XZ wander (frame-rate independent)
      dustPositions[i3] += Math.sin(elapsed * v.wx + v.px) * 0.002 * dt * 60
      dustPositions[i3 + 2] += Math.cos(elapsed * v.wz + v.pz) * 0.002 * dt * 60

      // Wrap Y
      if (dustPositions[i3 + 1] > maxY) {
        dustPositions[i3 + 1] = -0.2
      }

      // Clamp X
      if (dustPositions[i3] > halfX) dustPositions[i3] = -halfX
      if (dustPositions[i3] < -halfX) dustPositions[i3] = halfX

      // Wrap Z
      if (dustPositions[i3 + 2] > CORRIDOR_Z_MAX) {
        dustPositions[i3 + 2] = CORRIDOR_Z_MIN
      }
      if (dustPositions[i3 + 2] < CORRIDOR_Z_MIN) {
        dustPositions[i3 + 2] = CORRIDOR_Z_MAX
      }
    }

    // Signal Three.js to re-upload positions
    const posAttr = dustParticles.value.geometry.getAttribute('position')
    if (posAttr) {
      ;(posAttr as BufferAttribute).needsUpdate = true
    }
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  const canvas = document.querySelector('[data-section="books"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }

  createDustParticles()

  animationController.start((elapsed, delta) => {
    updateAnimations(elapsed, delta)
  })
})

onBeforeUnmount(() => {
  animationController.stop()
  if (dustParticles.value) {
    dustParticles.value.geometry.dispose()
    ;(dustParticles.value.material as PointsMaterial).dispose()
    dustParticles.value = null
  }
  dustPositions = null
  dustVelocities = []
})
</script>

<template>
  <!-- Camera: positioned at corridor entrance, will be overridden by animation -->
  <TresPerspectiveCamera :position="[0, 1.2, 0]" :fov="65" :near="0.1" :far="50" />

  <!-- ================================================================== -->
  <!-- Fog (quality-gated via density, 0 = no fog)                         -->
  <!-- ================================================================== -->
  <TresFogExp2 v-if="fogDensity > 0" :args="['#0A0A0A', fogDensity]" />

  <!-- ================================================================== -->
  <!-- Lighting                                                            -->
  <!-- ================================================================== -->

  <!-- Dim ambient — deep enchanted darkness -->
  <TresAmbientLight :intensity="0.05" color="#FFFFFF" />

  <!-- Candle point lights along corridor -->
  <TresPointLight
    v-for="(pos, ci) in CANDLE_POSITIONS.slice(0, candleCount)"
    :key="`candle-${ci}`"
    :position="pos"
    :intensity="candleIntensities[ci]"
    :color="CANDLE_COLORS[ci]"
    :distance="8"
    :decay="2"
  />

  <!-- Moonlight from above — high quality only -->
  <TresDirectionalLight
    v-if="showMoonlight"
    :position="[1, 6, -5]"
    :intensity="0.12"
    color="#B0C4DE"
  />

  <!-- ================================================================== -->
  <!-- Floating glass shelves (4 total)                                    -->
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
      :metalness="shelfMetalness"
      :roughness="shelfRoughness"
    />
  </TresMesh>

  <!-- ================================================================== -->
  <!-- Books — upright standing on shelves                                 -->
  <!-- ================================================================== -->
  <TresGroup
    v-for="book in visibleBooks"
    :key="book.id"
    :position="[
      book.position[0],
      book.position[1] + bookAnimStates[book.index].dy,
      book.position[2],
    ]"
    :rotation="[0, book.rotationY + bookAnimStates[book.index].dRotY, 0]"
  >
    <!-- Front Cover -->
    <TresMesh :position="[0, 0, 0.065]">
      <TresBoxGeometry :args="[0.76, 1.08, 0.025]" />
      <TresMeshStandardMaterial
        :color="book.colors.cover"
        :roughness="0.55"
        :metalness="0.15"
      />
    </TresMesh>

    <!-- Back Cover -->
    <TresMesh :position="[0, 0, -0.065]">
      <TresBoxGeometry :args="[0.76, 1.08, 0.025]" />
      <TresMeshStandardMaterial
        :color="book.colors.cover"
        :roughness="0.55"
        :metalness="0.15"
      />
    </TresMesh>

    <!-- Spine -->
    <TresMesh
      :position="[-0.38, 0, 0]"
      :rotation="[Math.PI / 2, 0, 0]"
    >
      <TresCylinderGeometry :args="[0.09, 0.09, 1.08, spineSegments, 1, false, 0, Math.PI]" />
      <TresMeshStandardMaterial
        :color="book.colors.spine"
        :roughness="0.5"
        :metalness="0.2"
      />
    </TresMesh>

    <!-- Page Block -->
    <TresMesh :position="[0.02, 0, 0]">
      <TresBoxGeometry :args="[0.68, 1.0, 0.12]" />
      <TresMeshStandardMaterial
        color="#FFF8E7"
        :roughness="0.9"
        :metalness="0.0"
      />
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

    <!-- Spine Bands (non-minimal) -->
    <template v-if="!isMinimal">
      <TresMesh
        :position="[-0.38, 0.35, 0]"
        :rotation="[Math.PI / 2, 0, 0]"
      >
        <TresCylinderGeometry :args="[0.095, 0.095, 0.06, spineSegments, 1, false, 0, Math.PI]" />
        <TresMeshStandardMaterial
          :color="book.colors.emissive"
          :emissive="book.colors.emissive"
          :emissive-intensity="0.4"
          :roughness="0.4"
          :metalness="0.5"
        />
      </TresMesh>
      <TresMesh
        :position="[-0.38, -0.35, 0]"
        :rotation="[Math.PI / 2, 0, 0]"
      >
        <TresCylinderGeometry :args="[0.095, 0.095, 0.06, spineSegments, 1, false, 0, Math.PI]" />
        <TresMeshStandardMaterial
          :color="book.colors.emissive"
          :emissive="book.colors.emissive"
          :emissive-intensity="0.4"
          :roughness="0.4"
          :metalness="0.5"
        />
      </TresMesh>
    </template>

    <!-- Emissive glow sphere — read books, high quality only -->
    <TresMesh v-if="book.showGlow">
      <TresSphereGeometry :args="[0.7, 16, 16]" />
      <TresMeshBasicMaterial
        :color="book.colors.emissive"
        :opacity="0.08"
        :transparent="true"
      />
    </TresMesh>
  </TresGroup>

  <!-- ================================================================== -->
  <!-- Dust particles                                                      -->
  <!-- ================================================================== -->
  <primitive v-if="dustParticles" :object="dustParticles" />
</template>
