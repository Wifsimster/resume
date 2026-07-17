<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  BufferAttribute,
  BufferGeometry,
  AdditiveBlending,
  Points,
  PointsMaterial
} from 'three'
import { useLoop } from '@tresjs/core'

// The space companion, in real Three.js: a low-poly rocket, a UFO and a mini
// ringed planet take turns cruising across the viewport on waypoint steering,
// with a glowing Points trail. Rendered in a fixed transparent canvas overlay
// so it accompanies the visitor through every section.

const CAMERA_Z = 12
const FOV_RAD = (45 * Math.PI) / 180
const LEGS_PER_COMPANION = 5
const TRAIL_LENGTH = 14

const rocketRef = ref()
const ufoRef = ref()
const planetRef = ref()
const activeIndex = ref(0)

// --- Trail: single Points draw call, ring buffer of recent positions ---
const trailPositions = new Float32Array(TRAIL_LENGTH * 3)
const trailGeometry = new BufferGeometry()
trailGeometry.setAttribute('position', new BufferAttribute(trailPositions, 3))
const trailMaterial = new PointsMaterial({
  color: 0xc4b5fd,
  size: 0.12,
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
  blending: AdditiveBlending,
  sizeAttenuation: true
})
const trailPoints = new Points(trailGeometry, trailMaterial)
trailPoints.frustumCulled = false

// --- Motion state (plain objects, zero per-frame allocation) ---
const pos = { x: 0, y: 2 }
const vel = { x: 0.5, y: 0.1 }
const target = { x: 0, y: 0 }
let legs = 0
let boost = 0
let swapScale = 0
let trailWrite = 0
let trailAccumulator = 0

const SPEEDS = [1.6, 1.2, 0.8] // rocket, ufo, planet — world units/s

// Visible world extents at z=0 for the current viewport.
const extents = { x: 5, y: 5 }
const updateExtents = () => {
  extents.y = CAMERA_Z * Math.tan(FOV_RAD / 2)
  extents.x = extents.y * (window.innerWidth / Math.max(1, window.innerHeight))
}

const pickTarget = () => {
  // Mild edge bias, mirrored from the DOM version: mostly frames content but
  // regularly crosses the middle.
  const edge = Math.random() < 0.4
  const ex = extents.x * 0.86
  const ey = extents.y * 0.82
  if (edge) {
    target.x = (Math.random() < 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.35) * ex
    target.y = (Math.random() * 2 - 1) * ey
  } else {
    target.x = (Math.random() * 2 - 1) * ex * 0.7
    target.y = (Math.random() * 2 - 1) * ey * 0.7
  }
  legs += 1
  if (legs >= LEGS_PER_COMPANION) {
    legs = 0
    activeIndex.value = (activeIndex.value + 1) % 3
    swapScale = 0
  }
}

const onScroll = () => {
  boost = 1
}

const companions = () => [rocketRef.value, ufoRef.value, planetRef.value]

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta, elapsed }) => {
  const dt = Math.min(delta, 0.1)

  // Steering toward the current waypoint (frame-rate independent)
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.hypot(dx, dy) || 1
  const maxSpeed = SPEEDS[activeIndex.value] * (1 + boost * 1.8)
  const steer = 1 - Math.exp(-dt * 1.4)
  vel.x += ((dx / dist) * maxSpeed - vel.x) * steer
  vel.y += ((dy / dist) * maxSpeed - vel.y) * steer
  pos.x += vel.x * dt
  pos.y += vel.y * dt
  if (dist < 0.8) pickTarget()

  boost *= Math.exp(-dt * 1.2)
  swapScale += (1 - swapScale) * (1 - Math.exp(-dt * 6))

  const bob = Math.sin(elapsed * 1.8) * 0.12
  const objs = companions()
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i]
    if (!obj) continue
    const active = i === activeIndex.value
    obj.visible = active
    if (!active) continue

    obj.position.set(pos.x, pos.y + bob, 0)
    const scale = (0.75 + swapScale * 0.25 + boost * 0.15)
    obj.scale.setScalar(scale)

    if (i === 0) {
      // Rocket: nose (+y of the model) banks into the travel direction
      obj.rotation.z = Math.atan2(vel.y, vel.x) - Math.PI / 2
      obj.rotation.y = Math.sin(elapsed * 0.9) * 0.35
    } else if (i === 1) {
      // UFO: upright hover with a wobble + slow saucer spin
      obj.rotation.z = Math.sin(elapsed * 2.2) * 0.12
      obj.rotation.y = elapsed * 1.4
    } else {
      // Planet: lazy axial spin, fixed tilt
      obj.rotation.y = elapsed * 0.5
      obj.rotation.z = 0.4
    }
  }

  // Trail breadcrumbs (~every 60ms) into the ring buffer
  trailAccumulator += dt
  if (trailAccumulator > 0.06) {
    trailAccumulator = 0
    const o = trailWrite * 3
    trailPositions[o] = pos.x
    trailPositions[o + 1] = pos.y + bob
    trailPositions[o + 2] = -0.2
    trailWrite = (trailWrite + 1) % TRAIL_LENGTH
    ;(trailGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true
  }
  trailMaterial.opacity = 0.45 + boost * 0.4
})

onMounted(() => {
  updateExtents()
  // Seed the trail at the start position so no dots sit at the origin.
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    trailPositions[i * 3] = pos.x
    trailPositions[i * 3 + 1] = pos.y
    trailPositions[i * 3 + 2] = -0.2
  }
  pickTarget()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateExtents, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateExtents)
  trailGeometry.dispose()
  trailMaterial.dispose()
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, CAMERA_Z]" :fov="45" :look-at="[0, 0, 0]" />

  <TresAmbientLight :intensity="0.7" />
  <TresDirectionalLight :position="[4, 6, 8]" :intensity="1.6" />

  <!-- 🚀 Rocket: body + nose + engine glow + 3 fins -->
  <TresGroup ref="rocketRef">
    <TresMesh>
      <TresCylinderGeometry :args="[0.16, 0.2, 0.62, 12]" />
      <TresMeshStandardMaterial color="#E8E4F0" :roughness="0.35" :metalness="0.5" />
    </TresMesh>
    <TresMesh :position="[0, 0.47, 0]">
      <TresConeGeometry :args="[0.16, 0.34, 12]" />
      <TresMeshStandardMaterial color="#A855F7" :emissive="'#A855F7'" :emissive-intensity="0.35" :roughness="0.3" :metalness="0.6" />
    </TresMesh>
    <TresMesh :position="[0, -0.28, 0]">
      <TresCylinderGeometry :args="[0.11, 0.15, 0.12, 12]" />
      <TresMeshStandardMaterial color="#4B5563" :roughness="0.5" :metalness="0.8" />
    </TresMesh>
    <TresMesh :position="[0, -0.42, 0]">
      <TresSphereGeometry :args="[0.1, 10, 10]" />
      <TresMeshBasicMaterial color="#FDBA74" :transparent="true" :opacity="0.9" />
    </TresMesh>
    <TresMesh
      v-for="fin in 3"
      :key="`fin-${fin}`"
      :position="[Math.cos((fin * Math.PI * 2) / 3) * 0.18, -0.24, Math.sin((fin * Math.PI * 2) / 3) * 0.18]"
      :rotation="[0, -(fin * Math.PI * 2) / 3, 0]"
    >
      <TresBoxGeometry :args="[0.05, 0.26, 0.16]" />
      <TresMeshStandardMaterial color="#EC4899" :roughness="0.4" :metalness="0.4" />
    </TresMesh>
  </TresGroup>

  <!-- 🛸 UFO: saucer + glass dome + belt lights -->
  <TresGroup ref="ufoRef">
    <TresMesh :scale="[1, 0.32, 1]">
      <TresSphereGeometry :args="[0.42, 20, 12]" />
      <TresMeshStandardMaterial color="#94A3B8" :roughness="0.25" :metalness="0.85" />
    </TresMesh>
    <TresMesh :position="[0, 0.14, 0]">
      <TresSphereGeometry :args="[0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]" />
      <TresMeshStandardMaterial color="#22D3EE" :emissive="'#22D3EE'" :emissive-intensity="0.4" :transparent="true" :opacity="0.75" :roughness="0.1" :metalness="0.3" />
    </TresMesh>
    <TresMesh
      v-for="ballLight in 6"
      :key="`ufo-light-${ballLight}`"
      :position="[Math.cos((ballLight * Math.PI) / 3) * 0.34, -0.02, Math.sin((ballLight * Math.PI) / 3) * 0.34]"
    >
      <TresSphereGeometry :args="[0.045, 8, 8]" />
      <TresMeshBasicMaterial :color="ballLight % 2 === 0 ? '#F472B6' : '#FDE68A'" />
    </TresMesh>
  </TresGroup>

  <!-- 🪐 Mini ringed planet -->
  <TresGroup ref="planetRef">
    <TresMesh>
      <TresSphereGeometry :args="[0.32, 20, 20]" />
      <TresMeshStandardMaterial color="#FBBF24" :emissive="'#B45309'" :emissive-intensity="0.15" :roughness="0.6" :metalness="0.2" :flat-shading="true" />
    </TresMesh>
    <TresMesh :rotation="[Math.PI / 2.4, 0, 0]">
      <TresRingGeometry :args="[0.44, 0.62, 32]" />
      <TresMeshBasicMaterial color="#F9A8D4" :transparent="true" :opacity="0.6" :side="2" :depth-write="false" />
    </TresMesh>
  </TresGroup>

  <!-- Glowing trail (single Points draw call) -->
  <primitive :object="trailPoints" />
</template>
