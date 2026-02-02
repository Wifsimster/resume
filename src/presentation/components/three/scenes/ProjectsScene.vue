<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  BufferGeometry,
  BufferAttribute,
  LineSegments,
  LineBasicMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  AdditiveBlending,
  Vector3
} from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

// ── Types ───────────────────────────────────────────────────────────────────

interface Branch {
  start: Vector3
  end: Vector3
  direction: Vector3
  depth: number
  children: Branch[]
  /** Flat index used for sequential grow/dissolve ordering */
  flatIndex: number
}

const enum Phase {
  GROWING = 0,
  HOLDING = 1,
  DISSOLVING = 2,
  DEAD = 3
}

interface Structure {
  seed: Vector3
  root: Branch
  flatBranches: Branch[]
  phase: Phase
  phaseTime: number
  lines: LineSegments | null
  junctions: Mesh[] | null
  junctionGeometry: SphereGeometry | null
  colorBase: Color
  colorTip: Color
  paletteIndex: number
  /** When true, this structure is excess and should not be respawned after DEAD */
  markedForRemoval: boolean
}

// ── Props & animation controller ────────────────────────────────────────────

const props = defineProps<{
  quality: QualityLevel
}>()

const sectionElement = ref<HTMLElement | null>(null)
const animationController = useAnimationController(sectionElement)

// ── Constants ───────────────────────────────────────────────────────────────

const PALETTES = [
  { base: new Color('#7C3AED'), tip: new Color('#C4B5FD') }, // purple
  { base: new Color('#A855F7'), tip: new Color('#E9D5FF') }, // light purple
  { base: new Color('#6366F1'), tip: new Color('#C7D2FE') }, // indigo
]

const PHASE_DURATIONS: Record<Phase, number> = {
  [Phase.GROWING]: 2.0,
  [Phase.HOLDING]: 3.0,
  [Phase.DISSOLVING]: 1.5,
  [Phase.DEAD]: 0,
}

const BRANCH_DECAY = 0.68
const CHILD_COUNT_MIN = 2
const CHILD_COUNT_MAX = 3
const BASE_BRANCH_LENGTH = 1.8
const ANGLE_SPREAD = 0.7 // radians
const DIRECTION_NOISE = 0.3

// ── Quality-derived settings ────────────────────────────────────────────────

function getQualitySettings(q: QualityLevel) {
  switch (q) {
    case 'minimal': return { structureCount: 1, maxDepth: 3, junctions: false, particleCount: 0 }
    case 'low':     return { structureCount: 2, maxDepth: 4, junctions: false, particleCount: 80 }
    case 'high':    return { structureCount: 3, maxDepth: 5, junctions: true,  particleCount: 300 }
  }
}

// ── Three.js object refs ────────────────────────────────────────────────────

const sceneGroup = ref()
const ambientDust = shallowRef<Points | null>(null)

// Active structures
let structures: Structure[] = []
let currentMaxDepth = 0
let paletteCounter = 0
let cachedQS = getQualitySettings('minimal')

// ── Branch generation ───────────────────────────────────────────────────────

function randomSeed(): Vector3 {
  return new Vector3(
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 3
  )
}

/** Returns a random perpendicular(-ish) direction from the parent direction */
function childDirection(parentDir: Vector3): Vector3 {
  // Find a non-parallel axis for cross product
  const arbitrary = Math.abs(parentDir.y) < 0.9
    ? new Vector3(0, 1, 0)
    : new Vector3(1, 0, 0)

  const perp = new Vector3().crossVectors(parentDir, arbitrary).normalize()
  const perp2 = new Vector3().crossVectors(parentDir, perp).normalize()

  const angle = (Math.random() - 0.5) * 2 * ANGLE_SPREAD
  const tilt = (Math.random() - 0.5) * 2 * ANGLE_SPREAD

  const dir = new Vector3()
    .addScaledVector(parentDir, 0.6)
    .addScaledVector(perp, Math.sin(angle) * 0.8)
    .addScaledVector(perp2, Math.sin(tilt) * 0.8)

  // Add noise
  dir.x += (Math.random() - 0.5) * DIRECTION_NOISE
  dir.y += (Math.random() - 0.5) * DIRECTION_NOISE
  dir.z += (Math.random() - 0.5) * DIRECTION_NOISE

  return dir.normalize()
}

function generateBranch(
  start: Vector3,
  direction: Vector3,
  depth: number,
  maxDepth: number,
  flatIndex: { value: number }
): Branch {
  const length = BASE_BRANCH_LENGTH * Math.pow(BRANCH_DECAY, depth)
  const end = new Vector3().copy(start).addScaledVector(direction, length)

  const branch: Branch = {
    start: start.clone(),
    end: end.clone(),
    direction: direction.clone(),
    depth,
    children: [],
    flatIndex: flatIndex.value++
  }

  if (depth < maxDepth) {
    const childCount = CHILD_COUNT_MIN + Math.floor(Math.random() * (CHILD_COUNT_MAX - CHILD_COUNT_MIN + 1))
    for (let i = 0; i < childCount; i++) {
      const dir = childDirection(direction)
      branch.children.push(generateBranch(end, dir, depth + 1, maxDepth, flatIndex))
    }
  }

  return branch
}

function flattenBranches(branch: Branch): Branch[] {
  const result: Branch[] = [branch]
  for (const child of branch.children) {
    result.push(...flattenBranches(child))
  }
  return result
}

// ── Structure creation & rendering ──────────────────────────────────────────

function countBranches(maxDepth: number): number {
  // geometric series: 1 + 3 + 9 + 27 + ...  (rough upper bound with 3 children)
  let total = 0
  let level = 1
  for (let d = 0; d <= maxDepth; d++) {
    total += level
    level *= 3
  }
  return total
}

function createStructureLineSegments(
  flatBranches: Branch[],
  colorBase: Color,
  colorTip: Color,
  maxDepth: number
): LineSegments {
  const maxBranches = countBranches(maxDepth)
  // 2 vertices per line segment, 3 floats per vertex
  const positions = new Float32Array(maxBranches * 2 * 3)
  const colors = new Float32Array(maxBranches * 2 * 3)

  const tmpColor = new Color()

  for (let i = 0; i < flatBranches.length; i++) {
    const b = flatBranches[i]
    const idx = i * 6
    positions[idx] = b.start.x
    positions[idx + 1] = b.start.y
    positions[idx + 2] = b.start.z
    positions[idx + 3] = b.end.x
    positions[idx + 4] = b.end.y
    positions[idx + 5] = b.end.z

    // Color lerp based on depth
    const t = maxDepth > 0 ? b.depth / maxDepth : 0
    tmpColor.copy(colorBase).lerp(colorTip, t)

    colors[idx] = tmpColor.r
    colors[idx + 1] = tmpColor.g
    colors[idx + 2] = tmpColor.b
    // Tip is slightly brighter
    tmpColor.copy(colorBase).lerp(colorTip, Math.min(1, t + 0.15))
    colors[idx + 3] = tmpColor.r
    colors[idx + 4] = tmpColor.g
    colors[idx + 5] = tmpColor.b
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  geometry.setDrawRange(0, 0) // start hidden

  const material = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: AdditiveBlending,
    depthWrite: false
  })

  return new LineSegments(geometry, material)
}

function createJunctionSpheres(
  flatBranches: Branch[],
  colorBase: Color,
  colorTip: Color,
  maxDepth: number
): { meshes: Mesh[], geometry: SphereGeometry } {
  const geometry = new SphereGeometry(0.03, 6, 6)
  const meshes: Mesh[] = []
  const tmpColor = new Color()

  for (const b of flatBranches) {
    const t = maxDepth > 0 ? b.depth / maxDepth : 0
    tmpColor.copy(colorBase).lerp(colorTip, t)

    const mat = new MeshBasicMaterial({
      color: tmpColor.clone(),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false
    })

    const mesh = new Mesh(geometry, mat)
    mesh.position.copy(b.end)
    meshes.push(mesh)
  }

  return { meshes, geometry }
}

function spawnStructure(maxDepth: number): Structure {
  const seed = randomSeed()
  // Random initial direction (biased upward slightly)
  const direction = new Vector3(
    (Math.random() - 0.5) * 0.6,
    0.4 + Math.random() * 0.4,
    (Math.random() - 0.5) * 0.6
  ).normalize()

  const flatIndex = { value: 0 }
  const root = generateBranch(seed, direction, 0, maxDepth, flatIndex)
  const flatBranches = flattenBranches(root)

  const pIdx = paletteCounter++ % PALETTES.length
  const palette = PALETTES[pIdx]
  const colorBase = palette.base.clone()
  const colorTip = palette.tip.clone()

  const lines = createStructureLineSegments(flatBranches, colorBase, colorTip, maxDepth)

  const junctionResult = cachedQS.junctions
    ? createJunctionSpheres(flatBranches, colorBase, colorTip, maxDepth)
    : null

  return {
    seed,
    root,
    flatBranches,
    phase: Phase.GROWING,
    phaseTime: 0,
    lines,
    junctions: junctionResult?.meshes ?? null,
    junctionGeometry: junctionResult?.geometry ?? null,
    colorBase,
    colorTip,
    paletteIndex: pIdx,
    markedForRemoval: false
  }
}

function addStructureToScene(s: Structure) {
  const group = sceneGroup.value
  if (!group) return
  if (s.lines) group.add(s.lines)
  if (s.junctions) {
    for (const mesh of s.junctions) {
      group.add(mesh)
    }
  }
}

function removeStructureFromScene(s: Structure) {
  const group = sceneGroup.value
  if (!group) return
  if (s.lines) group.remove(s.lines)
  if (s.junctions) {
    for (const mesh of s.junctions) {
      group.remove(mesh)
    }
  }
}

function disposeStructure(s: Structure) {
  if (s.lines) {
    s.lines.geometry.dispose()
    ;(s.lines.material as LineBasicMaterial).dispose()
    s.lines = null
  }
  if (s.junctions) {
    for (const mesh of s.junctions) {
      ;(mesh.material as MeshBasicMaterial).dispose()
    }
    s.junctions = null
  }
  if (s.junctionGeometry) {
    s.junctionGeometry.dispose()
    s.junctionGeometry = null
  }
}

// ── Animation: easing helpers ───────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// ── Structure lifecycle update ──────────────────────────────────────────────

function updateStructure(s: Structure, delta: number, elapsed: number) {
  s.phaseTime += delta

  const totalBranches = s.flatBranches.length
  if (totalBranches === 0 || !s.lines) return

  const mat = s.lines.material as LineBasicMaterial

  switch (s.phase) {
    case Phase.GROWING: {
      const progress = Math.min(1, s.phaseTime / PHASE_DURATIONS[Phase.GROWING])
      const eased = easeOutCubic(progress)
      // Sequentially reveal branches: each branch appears when eased progress reaches its slot
      const visibleCount = Math.floor(eased * totalBranches)
      s.lines.geometry.setDrawRange(0, visibleCount * 2) // 2 verts per segment

      // Junction spheres fade in
      if (s.junctions) {
        for (let i = 0; i < s.junctions.length; i++) {
          const branchProgress = i / totalBranches
          const sphereOpacity = branchProgress < eased ? Math.min(0.6, (eased - branchProgress) * 3) : 0
          ;(s.junctions[i].material as MeshBasicMaterial).opacity = sphereOpacity
        }
      }

      mat.opacity = 1
      if (progress >= 1) {
        s.phase = Phase.HOLDING
        s.phaseTime = 0
      }
      break
    }

    case Phase.HOLDING: {
      // Full structure visible with gentle shimmer
      s.lines.geometry.setDrawRange(0, totalBranches * 2)
      const shimmer = 0.85 + Math.sin(elapsed * 3 + s.seed.x * 10) * 0.15
      mat.opacity = shimmer

      if (s.junctions) {
        for (const mesh of s.junctions) {
          ;(mesh.material as MeshBasicMaterial).opacity = 0.4 + Math.sin(elapsed * 2.5) * 0.2
        }
      }

      if (s.phaseTime >= PHASE_DURATIONS[Phase.HOLDING]) {
        s.phase = Phase.DISSOLVING
        s.phaseTime = 0
      }
      break
    }

    case Phase.DISSOLVING: {
      const progress = Math.min(1, s.phaseTime / PHASE_DURATIONS[Phase.DISSOLVING])
      const eased = easeOutCubic(progress)
      // Reverse: fade tips first (highest flatIndex first)
      const visibleCount = Math.max(0, Math.floor((1 - eased) * totalBranches))
      s.lines.geometry.setDrawRange(0, visibleCount * 2)
      mat.opacity = 1 - eased * 0.5

      if (s.junctions) {
        for (let i = 0; i < s.junctions.length; i++) {
          const branchProgress = i / totalBranches
          ;(s.junctions[i].material as MeshBasicMaterial).opacity =
            branchProgress < (1 - eased) ? 0.4 * (1 - eased) : 0
        }
      }

      if (progress >= 1) {
        s.phase = Phase.DEAD
        s.phaseTime = 0
      }
      break
    }

    case Phase.DEAD:
      // Will be respawned by the manager
      break
  }
}

// ── Ambient dust particles ──────────────────────────────────────────────────

function createAmbientDust(count: number): Points {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))

  const material = new PointsMaterial({
    color: 0x8B5CF6,
    size: 0.03,
    transparent: true,
    opacity: 0.35,
    blending: AdditiveBlending,
    depthWrite: false
  })

  return new Points(geometry, material)
}

function disposeAmbientDust() {
  if (ambientDust.value) {
    ambientDust.value.geometry.dispose()
    ;(ambientDust.value.material as PointsMaterial).dispose()
    ambientDust.value = null
  }
}

// ── Scene lifecycle ─────────────────────────────────────────────────────────

function initStructures() {
  cachedQS = getQualitySettings(props.quality)
  currentMaxDepth = cachedQS.maxDepth

  // Stagger initial structures across lifecycle phases
  for (let i = 0; i < cachedQS.structureCount; i++) {
    const s = spawnStructure(currentMaxDepth)

    // Stagger: offset phase timing so scene is never empty
    const totalCycle = PHASE_DURATIONS[Phase.GROWING] + PHASE_DURATIONS[Phase.HOLDING] + PHASE_DURATIONS[Phase.DISSOLVING]
    const offset = (i / cachedQS.structureCount) * totalCycle

    // Pre-advance the structure through its lifecycle
    if (offset < PHASE_DURATIONS[Phase.GROWING]) {
      s.phase = Phase.GROWING
      s.phaseTime = offset
    } else if (offset < PHASE_DURATIONS[Phase.GROWING] + PHASE_DURATIONS[Phase.HOLDING]) {
      s.phase = Phase.HOLDING
      s.phaseTime = offset - PHASE_DURATIONS[Phase.GROWING]
      // Show all branches for HOLDING
      s.lines!.geometry.setDrawRange(0, s.flatBranches.length * 2)
    } else {
      s.phase = Phase.DISSOLVING
      s.phaseTime = offset - PHASE_DURATIONS[Phase.GROWING] - PHASE_DURATIONS[Phase.HOLDING]
    }

    structures.push(s)
    addStructureToScene(s)
  }
}

function rebuildDust() {
  const group = sceneGroup.value
  if (!group) return

  // Remove old dust
  if (ambientDust.value) {
    group.remove(ambientDust.value)
    disposeAmbientDust()
  }

  if (cachedQS.particleCount > 0) {
    ambientDust.value = createAmbientDust(cachedQS.particleCount)
    group.add(ambientDust.value)
  }
}

function teardownAll() {
  for (const s of structures) {
    removeStructureFromScene(s)
    disposeStructure(s)
  }
  structures = []

  const group = sceneGroup.value
  if (group && ambientDust.value) {
    group.remove(ambientDust.value)
  }
  disposeAmbientDust()
}

// ── Main animation loop ─────────────────────────────────────────────────────

let startTime = 0

function updateAnimations(elapsed: number, delta: number) {
  // Update each structure and handle dead ones
  for (let i = structures.length - 1; i >= 0; i--) {
    const s = structures[i]
    updateStructure(s, delta, elapsed)

    if (s.phase === Phase.DEAD) {
      removeStructureFromScene(s)
      disposeStructure(s)

      if (s.markedForRemoval) {
        // Excess structure finished dissolving — remove from array
        structures.splice(i, 1)
      } else {
        // Normal lifecycle — respawn at new position
        const newS = spawnStructure(currentMaxDepth)
        structures[i] = newS
        addStructureToScene(newS)
      }
    }
  }

  // Mark excess structures for dissolve (quality downgrade)
  const targetCount = cachedQS.structureCount
  let activeCount = structures.filter(s => !s.markedForRemoval).length
  for (let i = structures.length - 1; i >= 0 && activeCount > targetCount; i--) {
    const s = structures[i]
    if (!s.markedForRemoval) {
      s.markedForRemoval = true
      if (s.phase !== Phase.DISSOLVING && s.phase !== Phase.DEAD) {
        s.phase = Phase.DISSOLVING
        s.phaseTime = 0
      }
      activeCount--
    }
  }

  // Spawn new structures if needed (quality upgrade)
  while (activeCount < targetCount) {
    const s = spawnStructure(currentMaxDepth)
    structures.push(s)
    addStructureToScene(s)
    activeCount++
  }

  // Rotate ambient dust slowly
  if (ambientDust.value) {
    ambientDust.value.rotation.y = elapsed * 0.02
    ambientDust.value.rotation.x = Math.sin(elapsed * 0.03) * 0.05
  }

  // Gentle scene rotation
  if (sceneGroup.value) {
    sceneGroup.value.rotation.y = Math.sin(elapsed * 0.08) * 0.06
  }
}

// ── Quality change watcher ──────────────────────────────────────────────────

watch(() => props.quality, (newQ) => {
  cachedQS = getQualitySettings(newQ)
  currentMaxDepth = cachedQS.maxDepth
  rebuildDust()

  // Handle junction sphere add/remove on quality change
  for (const s of structures) {
    if (cachedQS.junctions && !s.junctions && s.lines) {
      const result = createJunctionSpheres(s.flatBranches, s.colorBase, s.colorTip, currentMaxDepth)
      s.junctions = result.meshes
      s.junctionGeometry = result.geometry
      const group = sceneGroup.value
      if (group) {
        for (const mesh of s.junctions) group.add(mesh)
      }
    } else if (!cachedQS.junctions && s.junctions) {
      const group = sceneGroup.value
      if (group) {
        for (const mesh of s.junctions) group.remove(mesh)
      }
      for (const mesh of s.junctions) {
        ;(mesh.material as MeshBasicMaterial).dispose()
      }
      s.junctions = null
      if (s.junctionGeometry) {
        s.junctionGeometry.dispose()
        s.junctionGeometry = null
      }
    }
  }
})

// ── Mount & unmount ─────────────────────────────────────────────────────────

onMounted(() => {
  const canvas = document.querySelector('[data-section="projects"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }

  startTime = Date.now()

  initStructures()
  rebuildDust()

  animationController.start((_elapsed, delta) => {
    const totalElapsed = (Date.now() - startTime) / 1000
    // delta from controller is in ms, convert to seconds
    updateAnimations(totalElapsed, delta / 1000)
  })
})

onBeforeUnmount(() => {
  animationController.stop()
  teardownAll()
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 8]" :look-at="[0, 0, 0]" />

  <!-- Minimal lighting — structures are self-lit via additive blending -->
  <TresAmbientLight :intensity="0.15" />
  <TresPointLight :position="[0, 3, 5]" :intensity="0.4" color="#7C3AED" />

  <TresGroup ref="sceneGroup">
    <!-- Structures, dust, and junctions are added programmatically -->
  </TresGroup>
</template>
