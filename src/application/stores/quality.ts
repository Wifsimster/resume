import { useMemo } from 'react'
import { create } from 'zustand'

export type QualityLevel = 'minimal' | 'low' | 'high'

export interface RenderSettings {
  dpr: number
  antialias: boolean
  powerPreference: 'high-performance' | 'low-power' | 'default'
  particleMultiplier: number
  segmentMultiplier: number
  targetFPS: number
  lightCount: number
}

interface DeviceCapabilities {
  isMobile: boolean
  isTouch: boolean
  gpu: string
  gpuTier: 'low' | 'medium' | 'high'
  deviceMemory: number
  hardwareConcurrency: number
  nativeDpr: number
  prefersReducedMotion: boolean
}

const STORAGE_KEY = 'wifsimster_quality'

const detectGPU = (): { renderer: string, tier: 'low' | 'medium' | 'high' } => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null

    if (!gl) {
      return { renderer: 'unknown', tier: 'low' }
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : 'unknown'

    gl.getExtension('WEBGL_lose_context')?.loseContext()

    const rendererLower = renderer.toLowerCase()

    const lowEndPatterns = [
      'intel hd graphics',
      'intel uhd graphics',
      'intel iris',
      'mali-4',
      'mali-t',
      'adreno 3',
      'adreno 4',
      'adreno 5',
      'powervr',
      'sgx',
      'videocore',
      'llvmpipe',
      'swiftshader',
      'software'
    ]

    const highEndPatterns = [
      'nvidia geforce rtx',
      'nvidia geforce gtx 10',
      'nvidia geforce gtx 16',
      'nvidia geforce gtx 20',
      'nvidia geforce gtx 30',
      'nvidia geforce gtx 40',
      'radeon rx 5',
      'radeon rx 6',
      'radeon rx 7',
      'apple m1',
      'apple m2',
      'apple m3',
      'apple gpu',
      'adreno 7',
      'mali-g7',
      'mali-g6'
    ]

    if (lowEndPatterns.some(p => rendererLower.includes(p))) {
      return { renderer, tier: 'low' }
    }

    if (highEndPatterns.some(p => rendererLower.includes(p))) {
      return { renderer, tier: 'high' }
    }

    return { renderer, tier: 'medium' }
  } catch {
    return { renderer: 'unknown', tier: 'low' }
  }
}

let cachedCapabilities: DeviceCapabilities | null = null
const detectDeviceCapabilities = (): DeviceCapabilities => {
  if (cachedCapabilities) return cachedCapabilities
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const gpuInfo = detectGPU()
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const nativeDpr = Math.min(window.devicePixelRatio || 1, 3)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  cachedCapabilities = {
    isMobile,
    isTouch,
    gpu: gpuInfo.renderer,
    gpuTier: gpuInfo.tier,
    deviceMemory,
    hardwareConcurrency,
    nativeDpr,
    prefersReducedMotion
  }
  return cachedCapabilities
}

const detectQuality = (): QualityLevel => {
  const saved = localStorage.getItem(STORAGE_KEY) as QualityLevel | null
  if (saved === 'minimal' || saved === 'low' || saved === 'high') return saved

  const caps = detectDeviceCapabilities()

  if (caps.prefersReducedMotion) {
    return 'minimal'
  }

  let score = 0

  if (caps.gpuTier === 'high') score += 3
  else if (caps.gpuTier === 'medium') score += 2
  else score += 0

  if (caps.hardwareConcurrency >= 8) score += 2
  else if (caps.hardwareConcurrency >= 4) score += 1

  if (caps.deviceMemory >= 8) score += 2
  else if (caps.deviceMemory >= 4) score += 1

  if (caps.isMobile) {
    score -= 3
    if (caps.gpuTier === 'low') score -= 1
  }

  if (caps.nativeDpr > 2) score -= 1

  if (score >= 5) return 'high'
  if (score >= 2) return 'low'
  return 'minimal'
}

export const getRenderSettings = (level: QualityLevel): RenderSettings => {
  const caps = detectDeviceCapabilities()
  const isMobile = caps.isMobile

  switch (level) {
    case 'minimal':
      return {
        dpr: 1,
        antialias: false,
        powerPreference: 'low-power',
        particleMultiplier: 0,
        segmentMultiplier: 0.25,
        targetFPS: 30,
        lightCount: 2
      }
    case 'low':
      return {
        dpr: 1,
        antialias: false,
        powerPreference: 'default',
        particleMultiplier: isMobile ? 0.25 : 0.5,
        segmentMultiplier: 0.5,
        targetFPS: 45,
        lightCount: 3
      }
    case 'high':
    default:
      return {
        dpr: Math.min(caps.nativeDpr, isMobile ? 1.5 : 2),
        antialias: !isMobile,
        powerPreference: 'high-performance',
        particleMultiplier: isMobile ? 0.5 : 1,
        segmentMultiplier: 1,
        targetFPS: 60,
        lightCount: isMobile ? 4 : 6
      }
  }
}

interface QualityState {
  quality: QualityLevel
  setQuality: (level: QualityLevel) => void
  cycleQuality: () => QualityLevel
  degradeOneStep: () => void
}

const persistQuality = (level: QualityLevel) => {
  localStorage.setItem(STORAGE_KEY, level)
}

export const useQualityStore = create<QualityState>((set, get) => ({
  quality: detectQuality(),
  setQuality: (level) => {
    set({ quality: level })
    persistQuality(level)
  },
  cycleQuality: () => {
    const levels: QualityLevel[] = ['minimal', 'low', 'high']
    const nextIndex = (levels.indexOf(get().quality) + 1) % levels.length
    const next = levels[nextIndex]
    set({ quality: next })
    persistQuality(next)
    return next
  },
  degradeOneStep: () => {
    const current = get().quality
    if (current === 'high') set({ quality: 'low' })
    else if (current === 'low') set({ quality: 'minimal' })
  }
}))

let fpsHistory: number[] = []
let lastFrameTime = performance.now()
let fpsMonitorEnabled = false
let animationFrameId: number | null = null
let lastDegradeTime = 0

const MAX_SAMPLE_DELTA = 250
const DEGRADE_COOLDOWN_MS = 3000

const degradeOneStep = (now: number) => {
  useQualityStore.getState().degradeOneStep()
  fpsHistory = []
  lastDegradeTime = now
}

const measureFPS = () => {
  if (!fpsMonitorEnabled) return

  const now = performance.now()
  const delta = now - lastFrameTime
  lastFrameTime = now

  if (delta > 0 && delta <= MAX_SAMPLE_DELTA) {
    const fps = 1000 / delta
    fpsHistory.push(fps)

    if (fpsHistory.length > 60) {
      fpsHistory.shift()
    }

    if (fpsHistory.length >= 30 && now - lastDegradeTime > DEGRADE_COOLDOWN_MS) {
      const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length

      const quality = useQualityStore.getState().quality
      const threshold = getRenderSettings(quality).targetFPS * 0.7

      if (avgFPS < threshold && quality !== 'minimal') {
        degradeOneStep(now)
      } else {
        const recentFPS = fpsHistory.slice(-10)
        const recentAvg = recentFPS.reduce((a, b) => a + b, 0) / recentFPS.length
        const earlierFPS = fpsHistory.slice(-30, -10)
        if (earlierFPS.length > 0) {
          const earlierAvg = earlierFPS.reduce((a, b) => a + b, 0) / earlierFPS.length
          if (earlierAvg > 0 && recentAvg < earlierAvg * 0.7 && quality !== 'minimal') {
            degradeOneStep(now)
          }
        }
      }
    }
  }

  animationFrameId = requestAnimationFrame(measureFPS)
}

export const startFPSMonitoring = () => {
  if (!fpsMonitorEnabled) {
    fpsMonitorEnabled = true
    fpsHistory = []
    lastFrameTime = performance.now()
    measureFPS()
  }
}

export const stopFPSMonitoring = () => {
  fpsMonitorEnabled = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

export const getAverageFPS = () => {
  if (fpsHistory.length === 0) return 0
  return fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length
}

export const deviceCapabilities = detectDeviceCapabilities()

export function useQuality() {
  const quality = useQualityStore(s => s.quality)
  const setQuality = useQualityStore(s => s.setQuality)
  const cycleQuality = useQualityStore(s => s.cycleQuality)
  const renderSettings = useMemo(() => getRenderSettings(quality), [quality])

  return {
    quality,
    renderSettings,
    deviceCapabilities,
    cycleQuality,
    setQuality,
    isHighQuality: () => useQualityStore.getState().quality === 'high',
    isMinimalQuality: () => useQualityStore.getState().quality === 'minimal',
    startFPSMonitoring,
    stopFPSMonitoring,
    getAverageFPS
  }
}
