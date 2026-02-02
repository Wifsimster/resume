<script setup lang="ts">
import { ref, computed, shallowRef, triggerRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial, AdditiveBlending } from 'three'
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
// Palette — one per book index, cycling
// ---------------------------------------------------------------------------
const bookPalette = [
  { cover: '#2C3E50', spine: '#1A252F', emissive: '#3498DB' }, // Blue
  { cover: '#8B4513', spine: '#5C2D0E', emissive: '#D2691E' }, // Brown
  { cover: '#1A237E', spine: '#0D1242', emissive: '#3949AB' }, // Indigo
  { cover: '#4A148C', spine: '#2E0D57', emissive: '#9C27B0' }, // Purple
  { cover: '#1B5E20', spine: '#0E3311', emissive: '#4CAF50' }, // Green
  { cover: '#B71C1C', spine: '#7A1212', emissive: '#E53935' }, // Red
  { cover: '#E65100', spine: '#993600', emissive: '#FF9800' }, // Orange
  { cover: '#01579B', spine: '#003A66', emissive: '#29B6F6' }, // Cyan
  { cover: '#4E342E', spine: '#2E1F1B', emissive: '#8D6E63' }, // Warm brown
  { cover: '#263238', spine: '#141B1F', emissive: '#78909C' }, // Slate
]

// ---------------------------------------------------------------------------
// Lissajous parameter sets (10 unique, irrational ratios)
// ---------------------------------------------------------------------------
const lissajousParams = [
  { ax: 3.2, ay: 1.6, az: 2.4, phaseX: 0.0, phaseY: 1.1, phaseZ: 2.3, Ax: 3.5, Ay: 1.6, Az: 2.5 },
  { ax: 2.1, ay: 2.7, az: 1.3, phaseX: 0.7, phaseY: 2.4, phaseZ: 0.5, Ax: 3.8, Ay: 1.8, Az: 2.8 },
  { ax: 1.7, ay: 3.1, az: 2.9, phaseX: 1.5, phaseY: 0.3, phaseZ: 1.9, Ax: 3.2, Ay: 1.4, Az: 2.2 },
  { ax: 2.9, ay: 1.3, az: 3.7, phaseX: 2.1, phaseY: 1.8, phaseZ: 0.2, Ax: 3.6, Ay: 1.7, Az: 2.6 },
  { ax: 3.7, ay: 2.3, az: 1.9, phaseX: 0.4, phaseY: 2.9, phaseZ: 1.3, Ax: 3.0, Ay: 1.5, Az: 2.4 },
  { ax: 1.3, ay: 3.7, az: 2.1, phaseX: 1.9, phaseY: 0.6, phaseZ: 2.7, Ax: 3.4, Ay: 1.9, Az: 2.3 },
  { ax: 2.6, ay: 1.9, az: 3.3, phaseX: 2.8, phaseY: 1.4, phaseZ: 0.8, Ax: 3.7, Ay: 1.3, Az: 2.9 },
  { ax: 3.3, ay: 2.6, az: 1.7, phaseX: 0.9, phaseY: 2.1, phaseZ: 1.6, Ax: 3.1, Ay: 1.6, Az: 2.1 },
  { ax: 1.9, ay: 3.3, az: 2.6, phaseX: 1.2, phaseY: 0.8, phaseZ: 2.5, Ax: 3.3, Ay: 1.7, Az: 2.7 },
  { ax: 2.3, ay: 1.7, az: 3.1, phaseX: 2.5, phaseY: 1.6, phaseZ: 0.4, Ax: 3.9, Ay: 1.5, Az: 2.0 },
]

// Tumble frequency sets (3-axis multi-frequency per book)
const tumbleParams = lissajousParams.map((_, i) => ({
  rx1: 0.07 + i * 0.012, rx2: 0.03 + i * 0.008,
  ry1: 0.05 + i * 0.01,  ry2: 0.025 + i * 0.007,
  rz1: 0.04 + i * 0.009, rz2: 0.02 + i * 0.006,
  px1: i * 0.7, px2: i * 1.3,
  py1: i * 0.9, py2: i * 1.1,
  pz1: i * 0.5, pz2: i * 1.5,
}))

// ---------------------------------------------------------------------------
// Quality-gated computeds
// ---------------------------------------------------------------------------
const isMinimal = computed(() => props.quality === 'minimal')
const isLow = computed(() => props.quality === 'low')
const isHigh = computed(() => props.quality === 'high')

const bookCount = computed(() => isMinimal.value ? 4 : isLow.value ? 6 : 8)
const openBookIndices = computed<number[]>(() => {
  if (isMinimal.value) return []
  if (isLow.value) return [1, 3]
  return [1, 3, 7]
})
const flutterPageCount = computed(() => isMinimal.value ? 0 : isLow.value ? 2 : 4)
const showDetail = computed(() => !isMinimal.value) // cover frame, bands, strip
const spineSegments = computed(() => isMinimal.value ? 6 : isLow.value ? 12 : 24)
const showGlowSpheres = computed(() => {
  if (isMinimal.value) return 'none'
  if (isLow.value) return 'read'
  return 'all'
})

// ---------------------------------------------------------------------------
// Visible books — derived from resume data + palette + open/ribbon flags
// ---------------------------------------------------------------------------
const visibleBooks = computed(() => {
  return resumeData.books.slice(0, bookCount.value).map((book, i) => {
    const colors = bookPalette[i % bookPalette.length]
    const isOpen = openBookIndices.value.includes(i)
    const hasRibbon = !isMinimal.value && book.status === 'read'
    const showGlow =
      showGlowSpheres.value === 'all' ||
      (showGlowSpheres.value === 'read' && book.status === 'read')
    return {
      ...book,
      index: i,
      colors,
      isOpen,
      hasRibbon,
      showGlow,
      liss: lissajousParams[i],
      tumble: tumbleParams[i],
    }
  })
})

// ---------------------------------------------------------------------------
// Reactive animation state (positions/rotations driven each frame)
// ---------------------------------------------------------------------------
interface BookState {
  px: number; py: number; pz: number
  rx: number; ry: number; rz: number
  // open book specific
  leftAngle: number; rightAngle: number
  flutterAngles: number[]
  // ribbon sway
  ribbonAngle: number
}

const bookStates = shallowRef<BookState[]>(
  Array.from({ length: 10 }, () => ({
    px: 0, py: 0, pz: 0,
    rx: 0, ry: 0, rz: 0,
    leftAngle: -0.35, rightAngle: 0.35,
    flutterAngles: [0, 0, 0, 0],
    ribbonAngle: 0,
  }))
)

// ---------------------------------------------------------------------------
// Refs
// ---------------------------------------------------------------------------
const sceneRef = ref()
const keyLightRef = ref()

// ---------------------------------------------------------------------------
// Particle systems (BufferGeometry + Points via <primitive>)
// ---------------------------------------------------------------------------
const goldenDust = shallowRef<Points | null>(null)
const ambientStars = shallowRef<Points | null>(null)

const createParticleSystems = () => {
  // Dispose existing
  if (goldenDust.value) {
    goldenDust.value.geometry.dispose()
    ;(goldenDust.value.material as PointsMaterial).dispose()
    goldenDust.value = null
  }
  if (ambientStars.value) {
    ambientStars.value.geometry.dispose()
    ;(ambientStars.value.material as PointsMaterial).dispose()
    ambientStars.value = null
  }

  if (isMinimal.value) return

  const dustCount = isHigh.value ? 500 : 150
  const starCount = isHigh.value ? 400 : 100

  // Golden dust — scattered within book volume (~8×4×6)
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 8
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 4
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6
  }
  const dustGeo = new BufferGeometry()
  dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3))
  const dustMat = new PointsMaterial({
    color: 0xFFD700,
    size: isHigh.value ? 0.035 : 0.05,
    opacity: 0.6,
    transparent: true,
    blending: AdditiveBlending,
  })
  goldenDust.value = new Points(dustGeo, dustMat)

  // Ambient stars — distant shell r=12..30
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const r = 12 + Math.random() * 18
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    starPos[i * 3 + 2] = r * Math.cos(phi)
  }
  const starGeo = new BufferGeometry()
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3))
  const starMat = new PointsMaterial({
    color: 0xFFFFFF,
    size: isHigh.value ? 0.06 : 0.08,
    opacity: 0.4,
    transparent: true,
  })
  ambientStars.value = new Points(starGeo, starMat)
}

watch(() => props.quality, createParticleSystems)

// ---------------------------------------------------------------------------
// Animation speed — global time multiplier (slow, dreamy)
// ---------------------------------------------------------------------------
const DRIFT_SPEED = 0.06

const updateAnimations = (elapsed: number, _delta: number) => {
  const t = elapsed * DRIFT_SPEED

  // 1. Scene subtle Y sway
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(t * 0.7) * 0.08
  }

  // 2-5. Per-book updates
  const count = bookCount.value
  for (let i = 0; i < count; i++) {
    const liss = lissajousParams[i]
    const tmb = tumbleParams[i]
    const state = bookStates.value[i]

    // Lissajous position
    state.px = liss.Ax * Math.sin(liss.ax * t + liss.phaseX)
    state.py = liss.Ay * Math.sin(liss.ay * t + liss.phaseY)
    state.pz = liss.Az * Math.sin(liss.az * t + liss.phaseZ)

    // Tumble rotation (multi-frequency sinusoidal)
    state.rx = Math.sin(tmb.rx1 * elapsed + tmb.px1) * 0.3 + Math.sin(tmb.rx2 * elapsed + tmb.px2) * 0.15
    state.ry = Math.sin(tmb.ry1 * elapsed + tmb.py1) * 0.4 + Math.sin(tmb.ry2 * elapsed + tmb.py2) * 0.2
    state.rz = Math.sin(tmb.rz1 * elapsed + tmb.pz1) * 0.2 + Math.sin(tmb.rz2 * elapsed + tmb.pz2) * 0.1

    // Flutter pages on open books
    if (openBookIndices.value.includes(i)) {
      const flutter = Math.sin(elapsed * 1.2 + i) * 0.03
      state.leftAngle = -0.4 + flutter
      state.rightAngle = 0.4 - flutter
      for (let p = 0; p < 4; p++) {
        state.flutterAngles[p] = Math.sin(elapsed * 1.5 + i * 0.7 + p * 0.9) * 0.25
      }
    }

    // Bookmark ribbon sway
    if (!isMinimal.value) {
      state.ribbonAngle = Math.sin(elapsed * 0.8 + i * 1.3) * 0.15
    }
  }

  // Batch-trigger reactivity once per frame (bookStates is shallowRef)
  triggerRef(bookStates)

  // 6. Particle system rotation
  if (goldenDust.value) {
    goldenDust.value.rotation.y = elapsed * 0.015
    goldenDust.value.rotation.x = Math.sin(elapsed * 0.04) * 0.05
  }
  if (ambientStars.value) {
    ambientStars.value.rotation.y = -elapsed * 0.005
  }

  // 7. Key light intensity pulse
  if (keyLightRef.value) {
    keyLightRef.value.intensity = 1.0 + Math.sin(elapsed * 0.3) * 0.2
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

  createParticleSystems()

  animationController.start((elapsed, delta) => {
    updateAnimations(elapsed, delta)
  })
})

onBeforeUnmount(() => {
  animationController.stop()
  if (goldenDust.value) {
    goldenDust.value.geometry.dispose()
    ;(goldenDust.value.material as PointsMaterial).dispose()
  }
  if (ambientStars.value) {
    ambientStars.value.geometry.dispose()
    ;(ambientStars.value.material as PointsMaterial).dispose()
  }
})
</script>

<template>
  <!-- Camera: wider FOV to see drifting books -->
  <TresPerspectiveCamera :position="[0, 2, 10]" :look-at="[0, 0, 0]" />

  <!-- ================================================================== -->
  <!-- Lighting                                                            -->
  <!-- ================================================================== -->
  <!-- Ambient: deep space feel -->
  <TresAmbientLight :intensity="0.08" />

  <!-- Key light: warm golden from above-front, all tiers -->
  <TresPointLight
    ref="keyLightRef"
    :position="[0, 4, 5]"
    :intensity="1.0"
    color="#FFE4B5"
    :distance="20"
    :decay="2"
  />

  <!-- Rim lights (low + high) -->
  <TresPointLight
    v-if="!isMinimal"
    :position="[-5, 2, 3]"
    :intensity="0.35"
    color="#4A90D9"
    :distance="15"
  />
  <TresPointLight
    v-if="!isMinimal"
    :position="[5, 1, 3]"
    :intensity="0.35"
    color="#D4A574"
    :distance="15"
  />

  <!-- Backlight: purple depth (high only) -->
  <TresPointLight
    v-if="isHigh"
    :position="[0, 0, -6]"
    :intensity="0.25"
    color="#7B1FA2"
    :distance="18"
  />

  <!-- Fill directional (high only) -->
  <TresDirectionalLight
    v-if="isHigh"
    :position="[2, 3, 4]"
    :intensity="0.15"
    color="#FFFFFF"
  />

  <!-- ================================================================== -->
  <!-- Scene root                                                          -->
  <!-- ================================================================== -->
  <TresGroup ref="sceneRef">
    <!-- ============================================================== -->
    <!-- Books v-for                                                     -->
    <!-- ============================================================== -->
    <TresGroup
      v-for="book in visibleBooks"
      :key="book.id"
      :position="[
        bookStates[book.index].px,
        bookStates[book.index].py,
        bookStates[book.index].pz,
      ]"
      :rotation="[
        bookStates[book.index].rx,
        bookStates[book.index].ry,
        bookStates[book.index].rz,
      ]"
    >
      <!-- ============================================================ -->
      <!-- CLOSED BOOK (default)                                         -->
      <!-- ============================================================ -->
      <TresGroup v-if="!book.isOpen">
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

        <!-- Spine (half-cylinder approximated with CylinderGeometry) -->
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

        <!-- Page Block (cream, inset from covers) -->
        <TresMesh :position="[0.02, 0, 0]">
          <TresBoxGeometry :args="[0.68, 1.0, 0.12]" />
          <TresMeshStandardMaterial
            color="#FFF8E7"
            :roughness="0.9"
            :metalness="0.0"
          />
        </TresMesh>

        <!-- Page Edge: Top -->
        <TresMesh :position="[0.02, 0.505, 0]">
          <TresBoxGeometry :args="[0.68, 0.01, 0.12]" />
          <TresMeshStandardMaterial color="#E8DCC8" :roughness="0.85" />
        </TresMesh>

        <!-- Page Edge: Bottom -->
        <TresMesh :position="[0.02, -0.505, 0]">
          <TresBoxGeometry :args="[0.68, 0.01, 0.12]" />
          <TresMeshStandardMaterial color="#E8DCC8" :roughness="0.85" />
        </TresMesh>

        <!-- Page Edge: Fore-edge (right side) -->
        <TresMesh :position="[0.365, 0, 0]">
          <TresBoxGeometry :args="[0.01, 1.0, 0.12]" />
          <TresMeshStandardMaterial color="#E8DCC8" :roughness="0.85" />
        </TresMesh>

        <!-- Cover Frame (4 borders on front cover) — detail tier -->
        <template v-if="showDetail">
          <!-- Top frame -->
          <TresMesh :position="[0, 0.525, 0.08]">
            <TresBoxGeometry :args="[0.72, 0.02, 0.005]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :metalness="0.7"
              :roughness="0.3"
            />
          </TresMesh>
          <!-- Bottom frame -->
          <TresMesh :position="[0, -0.525, 0.08]">
            <TresBoxGeometry :args="[0.72, 0.02, 0.005]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :metalness="0.7"
              :roughness="0.3"
            />
          </TresMesh>
          <!-- Left frame -->
          <TresMesh :position="[-0.355, 0, 0.08]">
            <TresBoxGeometry :args="[0.02, 1.05, 0.005]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :metalness="0.7"
              :roughness="0.3"
            />
          </TresMesh>
          <!-- Right frame -->
          <TresMesh :position="[0.355, 0, 0.08]">
            <TresBoxGeometry :args="[0.02, 1.05, 0.005]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :metalness="0.7"
              :roughness="0.3"
            />
          </TresMesh>
        </template>

        <!-- Spine Bands (2) — detail tier -->
        <template v-if="showDetail">
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

        <!-- Spine Title Strip — detail tier -->
        <TresMesh
          v-if="showDetail"
          :position="[-0.47, 0, 0]"
          :rotation="[0, -Math.PI / 2, 0]"
        >
          <TresPlaneGeometry :args="[0.08, 0.5]" />
          <TresMeshStandardMaterial
            :color="book.colors.emissive"
            :emissive="book.colors.emissive"
            :emissive-intensity="0.6"
            :side="2"
            :transparent="true"
            :opacity="0.8"
          />
        </TresMesh>

        <!-- Glow Sphere -->
        <TresMesh v-if="book.showGlow">
          <TresSphereGeometry :args="[0.7, 16, 16]" />
          <TresMeshBasicMaterial
            :color="book.colors.emissive"
            :opacity="0.08"
            :transparent="true"
          />
        </TresMesh>

        <!-- Bookmark Ribbon (read books only, 3 meshes) -->
        <TresGroup v-if="book.hasRibbon">
          <!-- Top anchor (inside pages at top) -->
          <TresMesh :position="[0.1, 0.54, 0.02]">
            <TresBoxGeometry :args="[0.03, 0.04, 0.005]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :roughness="0.6"
            />
          </TresMesh>
          <!-- Hanging part -->
          <TresMesh
            :position="[0.1, 0.35, 0.08]"
            :rotation="[bookStates[book.index].ribbonAngle * 0.3, 0, bookStates[book.index].ribbonAngle]"
          >
            <TresPlaneGeometry :args="[0.025, 0.35]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :side="2"
              :roughness="0.7"
            />
          </TresMesh>
          <!-- Tail (pointed end, only on full quality) -->
          <TresMesh
            v-if="isHigh"
            :position="[0.1, 0.15, 0.08]"
            :rotation="[bookStates[book.index].ribbonAngle * 0.5, 0, bookStates[book.index].ribbonAngle * 1.2]"
          >
            <TresPlaneGeometry :args="[0.03, 0.06]" />
            <TresMeshStandardMaterial
              :color="book.colors.emissive"
              :side="2"
              :roughness="0.7"
            />
          </TresMesh>
        </TresGroup>
      </TresGroup>

      <!-- ============================================================ -->
      <!-- OPEN BOOK                                                     -->
      <!-- ============================================================ -->
      <TresGroup v-else>
        <!-- Left half (cover + pages, pivoting at spine) -->
        <TresGroup :rotation="[0, bookStates[book.index].leftAngle, 0]">
          <!-- Left cover -->
          <TresMesh :position="[-0.38, 0, 0]">
            <TresBoxGeometry :args="[0.76, 1.08, 0.025]" />
            <TresMeshStandardMaterial
              :color="book.colors.cover"
              :roughness="0.55"
              :metalness="0.15"
            />
          </TresMesh>
          <!-- Left page stack -->
          <TresMesh :position="[-0.36, 0, 0.02]">
            <TresBoxGeometry :args="[0.68, 1.0, 0.03]" />
            <TresMeshStandardMaterial
              color="#FFF8E7"
              :roughness="0.9"
              :emissive="'#FBBF24'"
              :emissive-intensity="0.05"
            />
          </TresMesh>
        </TresGroup>

        <!-- Right half (cover + pages, pivoting at spine) -->
        <TresGroup :rotation="[0, bookStates[book.index].rightAngle, 0]">
          <!-- Right cover -->
          <TresMesh :position="[0.38, 0, 0]">
            <TresBoxGeometry :args="[0.76, 1.08, 0.025]" />
            <TresMeshStandardMaterial
              :color="book.colors.cover"
              :roughness="0.55"
              :metalness="0.15"
            />
          </TresMesh>
          <!-- Right page stack -->
          <TresMesh :position="[0.36, 0, 0.02]">
            <TresBoxGeometry :args="[0.68, 1.0, 0.03]" />
            <TresMeshStandardMaterial
              color="#FFF8E7"
              :roughness="0.9"
              :emissive="'#FBBF24'"
              :emissive-intensity="0.05"
            />
          </TresMesh>
        </TresGroup>

        <!-- Spine (center axis) -->
        <TresMesh :rotation="[Math.PI / 2, 0, 0]">
          <TresCylinderGeometry :args="[0.04, 0.04, 1.08, spineSegments, 1]" />
          <TresMeshStandardMaterial
            :color="book.colors.spine"
            :roughness="0.5"
            :metalness="0.2"
          />
        </TresMesh>

        <!-- Flutter pages between halves -->
        <TresMesh
          v-for="p in flutterPageCount"
          :key="`flutter-${book.id}-${p}`"
          :position="[0, 0, 0.04]"
          :rotation="[0, bookStates[book.index].flutterAngles[p - 1] || 0, 0]"
        >
          <TresPlaneGeometry :args="[0.7, 0.98]" />
          <TresMeshStandardMaterial
            color="#FFF8E7"
            :opacity="0.7 - p * 0.1"
            :transparent="true"
            :side="2"
            :roughness="0.95"
          />
        </TresMesh>

        <!-- Warm glow from open pages -->
        <TresMesh v-if="book.showGlow">
          <TresSphereGeometry :args="[0.8, 16, 16]" />
          <TresMeshBasicMaterial
            color="#FBBF24"
            :opacity="0.1"
            :transparent="true"
          />
        </TresMesh>
      </TresGroup>
    </TresGroup>
  </TresGroup>

  <!-- ================================================================== -->
  <!-- Particle primitives                                                 -->
  <!-- ================================================================== -->
  <primitive v-if="goldenDust" :object="goldenDust" />
  <primitive v-if="ambientStars" :object="ambientStars" />
</template>
