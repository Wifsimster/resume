<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useQuality } from '@application/composables/useQuality'

// A tiny space companion that cruises across the viewport through every
// section: a rocket, a UFO, a comet, a satellite or a mini planet, taking
// turns. Pure DOM + compositor transforms (translate/rotate/scale), one rAF,
// zero allocations per frame — it costs nothing and keeps the page alive.

interface CompanionDef {
  emoji: string
  /** how the sprite orients: face travel direction, spin slowly, stay upright */
  facing: 'direction' | 'spin' | 'upright'
  /** rotation offset so the glyph's nose aligns with the travel direction */
  angleOffset: number
  /** cruise speed in px/s */
  speed: number
  /** amplitude of the vertical bob in px */
  bob: number
  size: string
}

const COMPANIONS: CompanionDef[] = [
  { emoji: '🚀', facing: 'direction', angleOffset: Math.PI / 4, speed: 110, bob: 4, size: '30px' },
  { emoji: '🛸', facing: 'upright', angleOffset: 0, speed: 85, bob: 9, size: '30px' },
  { emoji: '☄️', facing: 'direction', angleOffset: (3 * Math.PI) / 4, speed: 150, bob: 3, size: '28px' },
  { emoji: '🛰️', facing: 'spin', angleOffset: 0, speed: 55, bob: 5, size: '27px' },
  { emoji: '🪐', facing: 'spin', angleOffset: 0, speed: 45, bob: 6, size: '30px' }
]

/** Waypoints per companion before handing over to the next one. */
const LEGS_PER_COMPANION = 5
const TRAIL_LENGTH = 6

// One compositor-transformed DOM sprite is cheap on any device, so the
// companion flies on every quality tier — only reduced-motion grounds it.
const { deviceCapabilities } = useQuality()
const visible = computed(() => !deviceCapabilities.prefersReducedMotion)

const companionIndex = ref(0)
const companion = computed(() => COMPANIONS[companionIndex.value])

const spriteRef = ref<HTMLElement | null>(null)
const trailRefs = Array.from({ length: TRAIL_LENGTH }, () => ref<HTMLElement | null>(null))

// --- Motion state (plain mutable objects, never reactive) ---
const pos = { x: 120, y: 160 }
const vel = { x: 30, y: 10 }
const target = { x: 0, y: 0 }
let legs = 0
let boost = 0
let spin = 0
let swapScale = 1
const trail: { x: number; y: number }[] = Array.from({ length: TRAIL_LENGTH }, () => ({
  x: pos.x,
  y: pos.y
}))
let trailAccumulator = 0

const pickTarget = () => {
  const w = window.innerWidth
  const h = window.innerHeight
  // Bias waypoints toward the outer bands so the companion mostly frames the
  // content instead of parking on top of it.
  const edge = Math.random() < 0.65
  if (edge) {
    const side = Math.floor(Math.random() * 4)
    if (side === 0) { target.x = 0.04 * w + Math.random() * 0.16 * w; target.y = 0.1 * h + Math.random() * 0.8 * h }
    else if (side === 1) { target.x = 0.8 * w + Math.random() * 0.16 * w; target.y = 0.1 * h + Math.random() * 0.8 * h }
    else if (side === 2) { target.x = 0.1 * w + Math.random() * 0.8 * w; target.y = 0.06 * h + Math.random() * 0.16 * h }
    else { target.x = 0.1 * w + Math.random() * 0.8 * w; target.y = 0.78 * h + Math.random() * 0.16 * h }
  } else {
    target.x = 0.15 * w + Math.random() * 0.7 * w
    target.y = 0.12 * h + Math.random() * 0.76 * h
  }
  legs += 1
  if (legs >= LEGS_PER_COMPANION) {
    legs = 0
    companionIndex.value = (companionIndex.value + 1) % COMPANIONS.length
    swapScale = 0 // pop-in animation for the newcomer
  }
}

const onScroll = () => {
  // Scrolling gives the companion a boost — thruster on, quicker travel.
  boost = 1
}

let rafId: number | null = null
let lastTime = 0

const tick = (now: number) => {
  const dt = Math.min((now - lastTime) / 1000, 0.1)
  lastTime = now

  const def = COMPANIONS[companionIndex.value]

  // Steering: ease velocity toward the desired vector (frame-rate independent)
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.hypot(dx, dy) || 1
  const maxSpeed = def.speed * (1 + boost * 1.8)
  const desiredX = (dx / dist) * maxSpeed
  const desiredY = (dy / dist) * maxSpeed
  const steer = 1 - Math.exp(-dt * 1.4)
  vel.x += (desiredX - vel.x) * steer
  vel.y += (desiredY - vel.y) * steer
  pos.x += vel.x * dt
  pos.y += vel.y * dt

  if (dist < 70) pickTarget()

  boost *= Math.exp(-dt * 1.2)
  spin += dt * 0.9
  swapScale += (1 - swapScale) * (1 - Math.exp(-dt * 6))

  // Orientation per personality
  let angle = 0
  if (def.facing === 'direction') {
    angle = Math.atan2(vel.y, vel.x) + def.angleOffset
  } else if (def.facing === 'spin') {
    angle = Math.sin(spin) * 0.5
  } else {
    angle = Math.sin(spin * 2.2) * 0.18 // upright wobble (UFO)
  }

  const bobY = Math.sin(now * 0.002) * def.bob
  const sprite = spriteRef.value
  if (sprite) {
    sprite.style.transform =
      `translate3d(${pos.x}px, ${pos.y + bobY}px, 0) rotate(${angle}rad) scale(${0.6 + swapScale * 0.4 + boost * 0.15})`
  }

  // Trail: record a breadcrumb every ~50ms, render as fading dots.
  trailAccumulator += dt
  if (trailAccumulator > 0.05) {
    trailAccumulator = 0
    for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
      trail[i].x = trail[i - 1].x
      trail[i].y = trail[i - 1].y
    }
    trail[0].x = pos.x
    trail[0].y = pos.y + bobY
  }
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const dot = trailRefs[i].value
    if (dot) {
      const scale = ((TRAIL_LENGTH - i) / TRAIL_LENGTH) * (0.5 + boost * 0.5)
      dot.style.transform = `translate3d(${trail[i].x}px, ${trail[i].y}px, 0) scale(${scale})`
      dot.style.opacity = String(0.35 * ((TRAIL_LENGTH - i) / TRAIL_LENGTH))
    }
  }

  rafId = requestAnimationFrame(tick)
}

const start = () => {
  if (rafId !== null) return
  lastTime = performance.now()
  pickTarget()
  rafId = requestAnimationFrame(tick)
}

const stop = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

watch(visible, (v) => (v ? start() : stop()))

const onResize = () => {
  pos.x = Math.min(pos.x, window.innerWidth - 40)
  pos.y = Math.min(pos.y, window.innerHeight - 40)
}

onMounted(() => {
  if (visible.value) start()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div v-if="visible" class="companion-layer fixed inset-0 z-40 pointer-events-none select-none" aria-hidden="true">
    <span
      v-for="(_, i) in TRAIL_LENGTH"
      :key="`trail-${i}`"
      :ref="el => (trailRefs[i].value = el as HTMLElement)"
      class="companion-trail-dot"
    />
    <span ref="spriteRef" class="companion-sprite" :style="{ fontSize: companion.size }">
      {{ companion.emoji }}
    </span>
  </div>
</template>

<style scoped>
.companion-sprite {
  position: absolute;
  top: -15px;
  left: -15px;
  line-height: 1;
  will-change: transform;
  filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.45));
}

.companion-trail-dot {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(196, 181, 253, 0.9) 0%, rgba(124, 58, 237, 0) 70%);
  will-change: transform, opacity;
}
</style>
