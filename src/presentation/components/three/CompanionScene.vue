<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  BufferAttribute,
  BufferGeometry,
  AdditiveBlending,
  Points,
  PointsMaterial,
  type Mesh,
  type MeshBasicMaterial
} from 'three'
import { useLoop } from '@tresjs/core'

// The space companions, in real Three.js: a rocket with a live flickering
// exhaust flame and a UFO with an animated abduction ray take turns cruising
// the viewport. Swaps are eased in/out, and every few swaps the two meet for
// a short choreographed dogfight (chase + laser bolts + tractor-beam capture)
// before the winner resumes the patrol. Zero per-frame allocations.

const CAMERA_Z = 12
const FOV_RAD = (45 * Math.PI) / 180
const TRAIL_LENGTH = 14

const LEGS_PER_SWAP = 5
const SWAPS_PER_FIGHT = 2
const SWAP_OUT_S = 0.45
const SWAP_IN_S = 0.6
// Fight timeline (seconds): chase w/ lasers → beam capture → break free + resolve
const FIGHT_CHASE_END = 3.5
const FIGHT_BEAM_END = 6.0
const FIGHT_END = 8.5

const rocketRef = ref()
const ufoRef = ref()
const flameOuterRef = ref()
const flameInnerRef = ref()
const beamRef = ref()
const beamDotRefs = [ref(), ref(), ref()]
const boltRefs = [ref(), ref(), ref()]

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

// --- Motion state: one body per companion (both simulated during fights) ---
interface Body {
  pos: { x: number; y: number }
  vel: { x: number; y: number }
  target: { x: number; y: number }
  scale: number
}
const bodies: [Body, Body] = [
  { pos: { x: 0, y: 2 }, vel: { x: 0.5, y: 0.1 }, target: { x: 0, y: 0 }, scale: 1 }, // rocket
  { pos: { x: -2, y: -1.5 }, vel: { x: -0.4, y: 0.2 }, target: { x: 0, y: 0 }, scale: 0 } // ufo
]
const SPEEDS = [1.6, 1.2]

type Mode = 'cruise' | 'swapOut' | 'swapIn' | 'fight'
let mode: Mode = 'cruise'
let modeTime = 0
let activeIndex = 0
let legs = 0
let swapsDone = 0
let boost = 0
let beamStrength = 0
let boltCooldown = 0
let fightWinner = 0
let trailWrite = 0
let trailAccumulator = 0

// Laser bolts (pooled, active only during fights)
const bolts = [
  { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 },
  { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 },
  { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 }
]

// Visible world extents at z=0 for the current viewport.
const extents = { x: 5, y: 5 }
const updateExtents = () => {
  extents.y = CAMERA_Z * Math.tan(FOV_RAD / 2)
  extents.x = extents.y * (window.innerWidth / Math.max(1, window.innerHeight))
}

const pickTarget = (body: Body, countLeg: boolean) => {
  const edge = Math.random() < 0.4
  const ex = extents.x * 0.86
  const ey = extents.y * 0.82
  if (edge) {
    body.target.x = (Math.random() < 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.35) * ex
    body.target.y = (Math.random() * 2 - 1) * ey
  } else {
    body.target.x = (Math.random() * 2 - 1) * ex * 0.7
    body.target.y = (Math.random() * 2 - 1) * ey * 0.7
  }
  if (countLeg) legs += 1
}

const onScroll = () => {
  boost = 1
}

// --- Pointer/touch awareness: the companion is shy up close and curious
// from afar. Cursor proximity makes it dodge away with a nervous wiggle;
// a click/tap far from it makes it fly over to investigate. ---
const cursor = { x: 0, y: 0, active: false }
let dodge = 0

const cursorToWorld = (clientX: number, clientY: number) => {
  cursor.x = ((clientX / window.innerWidth) * 2 - 1) * extents.x
  cursor.y = -((clientY / window.innerHeight) * 2 - 1) * extents.y
  cursor.active = true
}

const onPointerMove = (e: PointerEvent) => {
  cursorToWorld(e.clientX, e.clientY)
}

const onPointerDown = (e: PointerEvent) => {
  cursorToWorld(e.clientX, e.clientY)
  if (mode !== 'cruise' && mode !== 'swapIn') return
  const b = bodies[activeIndex]
  const d = Math.hypot(b.pos.x - cursor.x, b.pos.y - cursor.y)
  if (d > 2.2) {
    // Curious: fly over to where the visitor pointed
    b.target.x = cursor.x
    b.target.y = cursor.y
  } else {
    // Startled: afterburner kick + wiggle
    boost = 1
    dodge = 1
  }
}

const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const easeInBack = (t: number) => {
  const c1 = 1.70158
  return (c1 + 1) * t * t * t - c1 * t * t
}

const steer = (body: Body, dt: number, speed: number) => {
  const dx = body.target.x - body.pos.x
  const dy = body.target.y - body.pos.y
  const dist = Math.hypot(dx, dy) || 1
  const s = 1 - Math.exp(-dt * 1.4)
  body.vel.x += ((dx / dist) * speed - body.vel.x) * s
  body.vel.y += ((dy / dist) * speed - body.vel.y) * s
  body.pos.x += body.vel.x * dt
  body.pos.y += body.vel.y * dt
  return dist
}

const startFight = () => {
  mode = 'fight'
  modeTime = 0
  fightWinner = Math.random() < 0.5 ? 0 : 1
  // The idle companion warps in from the opposite side of the screen.
  const idle = bodies[1 - activeIndex]
  const act = bodies[activeIndex]
  idle.pos.x = -Math.sign(act.pos.x || 1) * extents.x * 0.7
  idle.pos.y = -act.pos.y * 0.5
  idle.vel.x = 0
  idle.vel.y = 0
}

// Debug hook used by the browser test harness (and curious devs).
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__companionFight = startFight
}

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta, elapsed }) => {
  const dt = Math.min(delta, 0.1)
  modeTime += dt
  boost *= Math.exp(-dt * 1.2)
  boltCooldown -= dt

  const rocket = bodies[0]
  const ufo = bodies[1]
  const active = bodies[activeIndex]
  const idle = bodies[1 - activeIndex]

  // ---------------- State machine ----------------
  if (mode === 'cruise') {
    const dist = steer(active, dt, SPEEDS[activeIndex] * (1 + boost * 1.8))
    if (dist < 0.8) pickTarget(active, true)
    active.scale += (1 - active.scale) * (1 - Math.exp(-dt * 6))
    idle.scale += (0 - idle.scale) * (1 - Math.exp(-dt * 8))
    if (legs >= LEGS_PER_SWAP) {
      legs = 0
      mode = 'swapOut'
      modeTime = 0
    }
  } else if (mode === 'swapOut') {
    const t = Math.min(modeTime / SWAP_OUT_S, 1)
    active.scale = Math.max(0, 1 - easeInBack(t))
    // Outgoing spins on itself while shrinking
    if (t >= 1) {
      swapsDone += 1
      activeIndex = 1 - activeIndex
      const next = bodies[activeIndex]
      next.pos.x = active.pos.x
      next.pos.y = active.pos.y
      next.vel.x = active.vel.x
      next.vel.y = active.vel.y
      pickTarget(next, false)
      if (swapsDone % SWAPS_PER_FIGHT === 0) {
        startFight()
      } else {
        mode = 'swapIn'
        modeTime = 0
      }
    }
  } else if (mode === 'swapIn') {
    const t = Math.min(modeTime / SWAP_IN_S, 1)
    active.scale = easeOutBack(t)
    steer(active, dt, SPEEDS[activeIndex])
    if (t >= 1) {
      mode = 'cruise'
      modeTime = 0
    }
  } else {
    // ---------------- Fight choreography ----------------
    // Scales only restore during the active phases — the resolve phase owns
    // the loser's scale (restoring it there previously fought the warp-out
    // shrink to a standstill and locked the whole state machine).
    if (modeTime < FIGHT_END) {
      rocket.scale += (1 - rocket.scale) * (1 - Math.exp(-dt * 6))
      ufo.scale += (1 - ufo.scale) * (1 - Math.exp(-dt * 6))
    }

    if (modeTime < FIGHT_CHASE_END) {
      // Chase: UFO flees between quick waypoints, rocket pursues it and fires.
      const fleeDist = Math.hypot(ufo.target.x - ufo.pos.x, ufo.target.y - ufo.pos.y)
      if (fleeDist < 1.2) pickTarget(ufo, false)
      steer(ufo, dt, 2.2)
      rocket.target.x = ufo.pos.x
      rocket.target.y = ufo.pos.y
      steer(rocket, dt, 2.6)
      if (boltCooldown <= 0) {
        boltCooldown = 0.55
        const bolt = bolts.find((b) => !b.active)
        if (bolt) {
          const dx = ufo.pos.x - rocket.pos.x
          const dy = ufo.pos.y - rocket.pos.y
          const d = Math.hypot(dx, dy) || 1
          bolt.active = true
          bolt.x = rocket.pos.x
          bolt.y = rocket.pos.y
          bolt.vx = (dx / d) * 7
          bolt.vy = (dy / d) * 7
          bolt.life = 1.1
        }
      }
    } else if (modeTime < FIGHT_BEAM_END) {
      // Counter-attack: the UFO hovers above the rocket and catches it in the
      // tractor beam; the rocket shakes, half-pulled upward.
      ufo.target.x = rocket.pos.x
      ufo.target.y = Math.min(rocket.pos.y + 2.1, extents.y * 0.8)
      steer(ufo, dt, 2.8)
      rocket.vel.x *= Math.exp(-dt * 3)
      rocket.vel.y *= Math.exp(-dt * 3)
      rocket.pos.x += rocket.vel.x * dt
      rocket.pos.y += rocket.vel.y * dt + dt * 0.35 // dragged up by the beam
    } else if (modeTime < FIGHT_END) {
      // Break free: rocket boosts away in a loop, UFO wobbles after it.
      rocket.target.x = -ufo.pos.x * 0.8
      rocket.target.y = -ufo.pos.y * 0.8
      steer(rocket, dt, 3.2)
      steer(ufo, dt, 1.6)
    } else {
      // Resolve: winner keeps cruising immediately, loser warps out.
      activeIndex = fightWinner
      const winnerBody = bodies[fightWinner]
      const wDist = steer(winnerBody, dt, SPEEDS[fightWinner])
      if (wDist < 0.8) pickTarget(winnerBody, false)
      const loser = bodies[1 - fightWinner]
      loser.scale = Math.max(0, loser.scale - dt / SWAP_OUT_S)
      if (loser.scale <= 0 || modeTime > FIGHT_END + 3) {
        // (time guard = belt-and-braces so a fight can never lock up again)
        loser.scale = 0
        mode = 'cruise'
        modeTime = 0
        legs = 0
        pickTarget(winnerBody, false)
      }
    }
  }

  // ---------------- Cursor evasion (cruise only — fights own the stage) ----
  if (cursor.active && (mode === 'cruise' || mode === 'swapIn')) {
    const b = bodies[activeIndex]
    const ex = b.pos.x - cursor.x
    const ey = b.pos.y - cursor.y
    const ed = Math.hypot(ex, ey)
    if (ed < 1.7 && ed > 0.0001) {
      const push = (1.7 - ed) * 6 * dt
      b.vel.x += (ex / ed) * push
      b.vel.y += (ey / ed) * push
      dodge = Math.min(1, dodge + dt * 5)
    }
  }
  dodge *= Math.exp(-dt * 2)

  // ---------------- Bolt simulation ----------------
  for (let i = 0; i < bolts.length; i++) {
    const b = bolts[i]
    if (b.active) {
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.life -= dt
      if (b.life <= 0) b.active = false
    }
    const meshRef = boltRefs[i].value as Mesh | undefined
    if (meshRef) {
      meshRef.visible = b.active
      if (b.active) meshRef.position.set(b.x, b.y, 0)
    }
  }

  // ---------------- Beam strength ----------------
  const inBeamPhase = mode === 'fight' && modeTime >= FIGHT_CHASE_END && modeTime < FIGHT_BEAM_END
  // In cruise the UFO shows off its ray on a slow duty cycle.
  const cruiseBeamOn = mode === 'cruise' && activeIndex === 1 && Math.sin(elapsed * 0.45) > 0.35
  const beamTarget = inBeamPhase || cruiseBeamOn ? 1 : 0
  beamStrength += (beamTarget - beamStrength) * (1 - Math.exp(-dt * 4))

  // ---------------- Draw ----------------
  const bobR = Math.sin(elapsed * 1.8) * 0.12
  const bobU = Math.sin(elapsed * 1.6 + 1.3) * 0.14

  const rocketObj = rocketRef.value
  if (rocketObj) {
    rocketObj.visible = rocket.scale > 0.01
    rocketObj.position.set(rocket.pos.x, rocket.pos.y + bobR, 0)
    let s = rocket.scale * (0.75 + boost * 0.15)
    const rocketSpinningOut =
      (mode === 'swapOut' && activeIndex === 0) ||
      (mode === 'fight' && modeTime >= FIGHT_END && fightWinner !== 0)
    if (rocketSpinningOut) {
      rocketObj.rotation.z += dt * 14 // exit pirouette
    } else {
      rocketObj.rotation.z = Math.atan2(rocket.vel.y, rocket.vel.x) - Math.PI / 2
      // Nervous wiggle when the cursor spooks it
      rocketObj.rotation.z += dodge * Math.sin(elapsed * 22) * 0.28
    }
    if (inBeamPhase) {
      // Caught in the beam: shake + point down helplessly
      rocketObj.position.x += Math.sin(elapsed * 42) * 0.05
      rocketObj.rotation.z += Math.sin(elapsed * 31) * 0.25
    }
    rocketObj.scale.setScalar(Math.max(s, 0.0001))
    rocketObj.rotation.y = Math.sin(elapsed * 0.9) * 0.35
  }

  // Flame: layered cones flicker fast; longer under boost or while fighting
  const flick = 0.5 + 0.35 * Math.sin(elapsed * 34) + 0.15 * Math.sin(elapsed * 61 + 2)
  const flameLen =
    0.85 + flick * 0.5 + boost * 0.9 + dodge * 0.5 + (mode === 'fight' ? 0.45 : 0)
  const outer = flameOuterRef.value as Mesh | undefined
  if (outer) {
    outer.scale.set(0.9 + flick * 0.25, flameLen, 0.9 + flick * 0.25)
    ;(outer.material as MeshBasicMaterial).opacity = 0.5 + flick * 0.3
  }
  const inner = flameInnerRef.value as Mesh | undefined
  if (inner) {
    inner.scale.set(0.85 + flick * 0.2, flameLen * 1.12, 0.85 + flick * 0.2)
    ;(inner.material as MeshBasicMaterial).opacity = 0.65 + flick * 0.3
  }

  const ufoObj = ufoRef.value
  if (ufoObj) {
    ufoObj.visible = ufo.scale > 0.01
    ufoObj.position.set(ufo.pos.x, ufo.pos.y + bobU, 0)
    ufoObj.scale.setScalar(Math.max(ufo.scale * 0.8, 0.0001))
    ufoObj.rotation.y = elapsed * 1.4
    const ufoSpinningOut =
      (mode === 'swapOut' && activeIndex === 1) ||
      (mode === 'fight' && modeTime >= FIGHT_END && fightWinner !== 1)
    if (ufoSpinningOut) {
      ufoObj.rotation.z += dt * 10
    } else {
      ufoObj.rotation.z =
        Math.sin(elapsed * 2.2) * 0.12 + ufo.vel.x * 0.06 + dodge * Math.sin(elapsed * 18) * 0.2
    }
  }

  // Tractor beam: pulsing opacity, breathing width, rising abduction dots
  const beam = beamRef.value as Mesh | undefined
  if (beam) {
    beam.visible = beamStrength > 0.02
    const pulse = 1 + Math.sin(elapsed * 6) * 0.08
    beam.scale.set(pulse, 1 + beamStrength * 0.15, pulse)
    ;(beam.material as MeshBasicMaterial).opacity = 0.24 * beamStrength * (0.85 + 0.15 * Math.sin(elapsed * 9))
  }
  for (let i = 0; i < beamDotRefs.length; i++) {
    const dot = beamDotRefs[i].value as Mesh | undefined
    if (!dot) continue
    const t = (elapsed * 0.5 + i / beamDotRefs.length) % 1
    dot.visible = beamStrength > 0.05
    dot.position.set(Math.sin(elapsed * 2.4 + i * 2.1) * 0.12 * (1 - t), -1.02 + t * 0.85, 0)
    ;(dot.material as MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * beamStrength * 0.9
  }

  // ---------------- Trail (follows the star of the moment) ----------------
  const followed = mode === 'fight' ? rocket : active
  trailAccumulator += dt
  if (trailAccumulator > 0.06) {
    trailAccumulator = 0
    const o = trailWrite * 3
    trailPositions[o] = followed.pos.x
    trailPositions[o + 1] = followed.pos.y + bobR
    trailPositions[o + 2] = -0.2
    trailWrite = (trailWrite + 1) % TRAIL_LENGTH
    ;(trailGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true
  }
  trailMaterial.opacity = 0.45 + boost * 0.4
})

onMounted(() => {
  updateExtents()
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    trailPositions[i * 3] = bodies[0].pos.x
    trailPositions[i * 3 + 1] = bodies[0].pos.y
    trailPositions[i * 3 + 2] = -0.2
  }
  pickTarget(bodies[0], false)
  pickTarget(bodies[1], false)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateExtents, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateExtents)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  trailGeometry.dispose()
  trailMaterial.dispose()
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, CAMERA_Z]" :fov="45" :look-at="[0, 0, 0]" />

  <TresAmbientLight :intensity="0.7" />
  <TresDirectionalLight :position="[4, 6, 8]" :intensity="1.6" />

  <!-- 🚀 Rocket: hull + nose + fins + layered animated exhaust flame -->
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

    <!-- Exhaust flame: outer orange sheath + inner white-hot core, both
         flickering in scale/opacity every frame (cone apex points down) -->
    <TresMesh ref="flameOuterRef" :position="[0, -0.62, 0]" :rotation="[Math.PI, 0, 0]">
      <TresConeGeometry :args="[0.13, 0.55, 12, 1, true]" />
      <TresMeshBasicMaterial
        color="#FB923C"
        :transparent="true"
        :opacity="0.7"
        :depth-write="false"
        :blending="2"
        :side="2"
      />
    </TresMesh>
    <TresMesh ref="flameInnerRef" :position="[0, -0.55, 0]" :rotation="[Math.PI, 0, 0]">
      <TresConeGeometry :args="[0.07, 0.38, 10, 1, true]" />
      <TresMeshBasicMaterial
        color="#FEF3C7"
        :transparent="true"
        :opacity="0.85"
        :depth-write="false"
        :blending="2"
        :side="2"
      />
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

  <!-- 🛸 UFO: saucer + dome + belt lights + animated abduction ray -->
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

    <!-- Abduction ray: open cyan cone flaring downward + rising capture dots -->
    <TresMesh ref="beamRef" :position="[0, -0.62, 0]">
      <TresCylinderGeometry :args="[0.09, 0.42, 0.95, 16, 1, true]" />
      <TresMeshBasicMaterial
        color="#22D3EE"
        :transparent="true"
        :opacity="0"
        :depth-write="false"
        :blending="2"
        :side="2"
      />
    </TresMesh>
    <TresMesh v-for="(_dot, di) in beamDotRefs" :key="`beam-dot-${di}`" :ref="el => (beamDotRefs[di].value = el)">
      <TresSphereGeometry :args="[0.045, 8, 8]" />
      <TresMeshBasicMaterial color="#A5F3FC" :transparent="true" :opacity="0" :depth-write="false" :blending="2" />
    </TresMesh>
  </TresGroup>

  <!-- Laser bolts (pooled, visible only during fights) -->
  <TresMesh v-for="(_bolt, bi) in boltRefs" :key="`bolt-${bi}`" :ref="el => (boltRefs[bi].value = el)" :visible="false">
    <TresSphereGeometry :args="[0.06, 8, 8]" />
    <TresMeshBasicMaterial color="#F472B6" :transparent="true" :opacity="0.95" :depth-write="false" :blending="2" />
  </TresMesh>

  <!-- Glowing trail (single Points draw call) -->
  <primitive :object="trailPoints" />
</template>
