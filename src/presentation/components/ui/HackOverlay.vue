<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuality } from '@application/composables/useQuality'
import { useAnimationController } from '@application/composables/useAnimationController'

const { renderSettings, isMinimalQuality, quality } = useQuality()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const controller = useAnimationController(containerRef)

let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let resizeObserver: ResizeObserver | null = null
let resizePending = false
let initialized = false

// --- Palette ---
// Amber (#FBBF24) and Green (#42B883) — matched to DustCanvas colors
const AMBER_RGB = '251,191,36'
const GREEN_RGB = '66,184,131'

// --- Effect state ---

interface GlitchLine {
  y: number
  height: number
  offsetX: number
  alpha: number
  birth: number
  duration: number
  isAmber: boolean
}

interface HackText {
  x: number
  y: number
  text: string
  alpha: number
  birth: number
  duration: number
  fontSize: number
}

interface ScanLine {
  startTime: number
  speed: number
  active: boolean
}

let glitchLines: GlitchLine[] = []
let hackTexts: HackText[] = []
let scanLine: ScanLine = { startTime: 0, speed: 0, active: false }

// Timers (next trigger time in seconds)
let nextGlitch = 0
let nextText = 0
let nextScan = 0

// Character pools
const HEX_CHARS = '0123456789ABCDEF'
const TEXT_FRAGMENTS = [
  '0x', '>>', '#!', '//', '&&', '||', '!=', '==', '::', '{}',
  'sudo', 'root', 'ssh', 'chmod', 'exec', 'init', 'null',
  'void', 'async', 'pipe', 'fork', 'kill', 'grep', 'curl',
]

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function generateHexString(): string {
  const type = Math.random()
  if (type < 0.3) {
    let s = ''
    const len = 4 + Math.floor(Math.random() * 5)
    for (let i = 0; i < len; i++) s += Math.random() < 0.5 ? '0' : '1'
    return s
  } else if (type < 0.6) {
    let s = '0x'
    const len = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < len; i++) s += HEX_CHARS[Math.floor(Math.random() * 16)]
    return s
  } else {
    return TEXT_FRAGMENTS[Math.floor(Math.random() * TEXT_FRAGMENTS.length)]
  }
}

function getFrequencyScale(): number {
  if (quality.value === 'low') return 1.8
  return 1
}

function initTimers() {
  const freq = getFrequencyScale()
  nextGlitch = randomRange(1, 3) * freq
  nextText = randomRange(0.5, 2) * freq
  nextScan = randomRange(2, 5) * freq
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  width = rect.width
  height = rect.height

  const isHigh = renderSettings.value.dpr > 1
  const dpr = isHigh ? Math.min(window.devicePixelRatio, 1.5) : 1

  // Setting canvas dimensions resets the context transform
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

function render(elapsed: number, _delta: number) {
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  const freq = getFrequencyScale()

  // --- Spawn new effects ---

  // Glitch lines
  if (elapsed > nextGlitch) {
    const count = 1 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      glitchLines.push({
        y: Math.random() * height,
        height: 2 + Math.random() * 4,
        offsetX: (Math.random() - 0.5) * 20,
        alpha: 0.08 + Math.random() * 0.12,
        birth: elapsed,
        duration: 0.05 + Math.random() * 0.08,
        isAmber: Math.random() < 0.5,
      })
    }
    nextGlitch = elapsed + randomRange(2, 6) * freq
  }

  // Hack texts
  if (elapsed > nextText) {
    const count = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i++) {
      hackTexts.push({
        x: Math.random() * (width - 80),
        y: 20 + Math.random() * (height - 40),
        text: generateHexString(),
        alpha: 0.12 + Math.random() * 0.08,
        birth: elapsed,
        duration: 0.2 + Math.random() * 0.3,
        fontSize: 10 + Math.floor(Math.random() * 4),
      })
    }
    nextText = elapsed + randomRange(1, 3) * freq
  }

  // Scan line (elapsed-based position for frame-drop immunity)
  if (!scanLine.active && elapsed > nextScan) {
    scanLine.active = true
    scanLine.startTime = elapsed
    scanLine.speed = height / (6 + Math.random() * 4)
  }

  // --- Update & draw ---

  // Scan line (elapsed-based y position)
  if (scanLine.active) {
    const y = (elapsed - scanLine.startTime) * scanLine.speed
    if (y > height) {
      scanLine.active = false
      nextScan = elapsed + randomRange(6, 12) * freq
    } else {
      // Simple filled rect instead of per-frame gradient allocation
      ctx.globalAlpha = 0.06
      ctx.fillStyle = `rgb(${GREEN_RGB})`
      ctx.fillRect(0, y - 1, width, 2)
      ctx.globalAlpha = 0.03
      ctx.fillRect(0, y - 4, width, 8)
      ctx.globalAlpha = 1
    }
  }

  // Glitch lines — batch by color, use globalAlpha for per-line opacity
  const colors = [AMBER_RGB, GREEN_RGB]
  for (let c = 0; c < 2; c++) {
    const isAmber = c === 0
    ctx.fillStyle = `rgb(${colors[c]})`

    for (let i = glitchLines.length - 1; i >= 0; i--) {
      const g = glitchLines[i]
      if (g.isAmber !== isAmber) continue
      const age = elapsed - g.birth
      if (age > g.duration) {
        glitchLines.splice(i, 1)
        continue
      }
      const fade = 1 - age / g.duration
      ctx.globalAlpha = g.alpha * fade
      ctx.fillRect(g.offsetX, g.y, width, g.height)
    }
  }
  ctx.globalAlpha = 1

  // Hack texts — all green, batch fillStyle, vary globalAlpha
  ctx.fillStyle = `rgb(${GREEN_RGB})`
  for (let i = hackTexts.length - 1; i >= 0; i--) {
    const h = hackTexts[i]
    const age = elapsed - h.birth
    if (age > h.duration) {
      hackTexts.splice(i, 1)
      continue
    }
    const t = age / h.duration
    const fade = t < 0.2 ? t / 0.2 : 1 - ((t - 0.2) / 0.8)
    ctx.globalAlpha = h.alpha * fade
    ctx.font = `${h.fontSize}px monospace`
    ctx.fillText(h.text, h.x, h.y)
  }
  ctx.globalAlpha = 1
}

function setup() {
  const container = containerRef.value
  if (!container) return

  resizeCanvas()
  initTimers()

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

  initialized = true
  controller.start(render)
}

onMounted(() => {
  if (isMinimalQuality()) return
  setup()
})

watch(() => renderSettings.value.particleMultiplier, (newVal) => {
  if (newVal === 0) {
    controller.stop()
    glitchLines = []
    hackTexts = []
    scanLine.active = false
    if (ctx) ctx.clearRect(0, 0, width, height)
  } else {
    if (!initialized) {
      setup()
    } else {
      initTimers()
      controller.start(render)
    }
  }
})

onBeforeUnmount(() => {
  controller.stop()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="section-canvas" style="z-index: 2; pointer-events: none;">
    <canvas ref="canvasRef" />
  </div>
</template>
