<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuality } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

const props = withDefaults(defineProps<{
  color?: string
  colorSecondary?: string
  opacity?: number
}>(), {
  color: '#A855F7',
  colorSecondary: '#6366F1',
  opacity: 0.6,
})

interface Particle {
  x: number
  y: number
  radius: number
  speedX: number
  speedY: number
  phase: number
  colorIndex: number // 0 = primary, 1 = secondary
  alpha: number
}

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { renderSettings, isMinimalQuality } = useQuality()
const controller = useAnimationController(containerRef)

const BASE_PARTICLE_COUNT = 80
const MOUSE_RADIUS = 120
const MOUSE_FORCE = 0.8

let particles: Particle[] = []
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let containerLeft = 0
let containerTop = 0
let mouseX = -9999
let mouseY = -9999
let resizeObserver: ResizeObserver | null = null
let resizePending = false
let initialized = false

// Cached RGB strings — recomputed only when props change (never in practice)
let primaryRgb = ''
let secondaryRgb = ''

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function cacheColors() {
  primaryRgb = hexToRgb(props.color)
  secondaryRgb = hexToRgb(props.colorSecondary)
}

function initParticles() {
  const multiplier = renderSettings.value.particleMultiplier
  const count = Math.floor(BASE_PARTICLE_COUNT * multiplier)
  particles = new Array(count)

  for (let i = 0; i < count; i++) {
    particles[i] = {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.5 + Math.random() * 1.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -0.1 - Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      colorIndex: Math.random() < 0.5 ? 0 : 1,
      alpha: 0.15 + Math.random() * 0.35,
    }
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  width = rect.width
  height = rect.height
  containerLeft = rect.left
  containerTop = rect.top

  const isHigh = renderSettings.value.dpr > 1
  const dpr = isHigh ? Math.min(window.devicePixelRatio, 1.5) : 1

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

function render(elapsed: number, delta: number) {
  if (!ctx || particles.length === 0) return

  ctx.clearRect(0, 0, width, height)

  const dt = (delta / 1000) * 60 // normalize to 60fps baseline
  const rgbs = [primaryRgb, secondaryRgb]

  // Batch by color: 2 fillStyle changes per frame, use globalAlpha for per-particle opacity
  for (let c = 0; c < 2; c++) {
    ctx.fillStyle = `rgb(${rgbs[c]})`

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (p.colorIndex !== c) continue

      // Sinusoidal oscillation
      const oscillation = Math.sin(elapsed * 0.5 + p.phase) * 0.3

      p.x += (p.speedX + oscillation * 0.1) * dt
      p.y += p.speedY * dt

      // Mouse repulsion
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const distSq = dx * dx + dy * dy
      const radiusSq = MOUSE_RADIUS * MOUSE_RADIUS

      if (distSq < radiusSq && distSq > 0) {
        const dist = Math.sqrt(distSq)
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE * dt
        p.x += (dx / dist) * force
        p.y += (dy / dist) * force
      }

      // Edge wrapping
      if (p.x < -5) p.x = width + 5
      else if (p.x > width + 5) p.x = -5
      if (p.y < -5) p.y = height + 5
      else if (p.y > height + 5) p.y = -5

      // Draw with globalAlpha (no string allocation per particle)
      ctx.globalAlpha = p.alpha * props.opacity
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX - containerLeft
  mouseY = e.clientY - containerTop
}

function onMouseLeave() {
  mouseX = -9999
  mouseY = -9999
}

function setup() {
  const container = containerRef.value
  if (!container) return

  cacheColors()
  resizeCanvas()
  initParticles()

  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (!resizePending) {
        resizePending = true
        requestAnimationFrame(() => {
          resizeCanvas()
          resizePending = false
        })
      }
    })
    resizeObserver.observe(container)
  }

  if (!initialized) {
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    initialized = true
  }

  controller.start(render)
}

onMounted(() => {
  if (isMinimalQuality()) return
  setup()
})

// Re-init particles when quality changes
watch(() => renderSettings.value.particleMultiplier, (newVal) => {
  if (newVal === 0) {
    controller.stop()
    particles = []
    if (ctx) ctx.clearRect(0, 0, width, height)
  } else {
    if (!initialized) {
      setup()
    } else {
      initParticles()
      controller.start(render)
    }
  }
})

onBeforeUnmount(() => {
  controller.stop()
  resizeObserver?.disconnect()

  const container = containerRef.value
  if (container) {
    container.removeEventListener('mousemove', onMouseMove)
    container.removeEventListener('mouseleave', onMouseLeave)
  }
})
</script>

<template>
  <div ref="containerRef" class="section-canvas">
    <canvas ref="canvasRef" />
  </div>
</template>
