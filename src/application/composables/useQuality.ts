import { ref, computed } from 'vue'

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

// Detect GPU capabilities via WebGL
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
    
    // Detect GPU tier based on renderer string
    const rendererLower = renderer.toLowerCase()
    
    // Low-end GPUs (integrated, mobile, old)
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
    
    // High-end GPUs
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

// Detect device capabilities
const detectDeviceCapabilities = (): DeviceCapabilities => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const gpuInfo = detectGPU()
  const deviceMemory = (navigator as any).deviceMemory || 4 // Default to 4GB if not available
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const nativeDpr = Math.min(window.devicePixelRatio || 1, 3) // Cap at 3
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  return {
    isMobile,
    isTouch,
    gpu: gpuInfo.renderer,
    gpuTier: gpuInfo.tier,
    deviceMemory,
    hardwareConcurrency,
    nativeDpr,
    prefersReducedMotion
  }
}

// Determine quality based on device capabilities
const detectQuality = (): QualityLevel => {
  // Check localStorage first
  const saved = localStorage.getItem(STORAGE_KEY) as QualityLevel | null
  if (saved === 'minimal' || saved === 'low' || saved === 'high') return saved
  
  const caps = detectDeviceCapabilities()
  
  // Force minimal for reduced motion preference
  if (caps.prefersReducedMotion) {
    return 'minimal'
  }
  
  // Score-based detection
  let score = 0
  
  // GPU tier contribution (0-3)
  if (caps.gpuTier === 'high') score += 3
  else if (caps.gpuTier === 'medium') score += 2
  else score += 0
  
  // CPU cores contribution (0-2)
  if (caps.hardwareConcurrency >= 8) score += 2
  else if (caps.hardwareConcurrency >= 4) score += 1
  
  // Memory contribution (0-2)
  if (caps.deviceMemory >= 8) score += 2
  else if (caps.deviceMemory >= 4) score += 1
  
  // Mobile penalty (more aggressive)
  if (caps.isMobile) {
    score -= 3 // Increased penalty for mobile
    // Additional penalty for low-end mobile GPUs
    if (caps.gpuTier === 'low') score -= 1
  }
  
  // High DPR penalty (more pixels to render)
  if (caps.nativeDpr > 2) score -= 1

  // Determine quality level
  if (score >= 5) return 'high'
  if (score >= 2) return 'low'
  return 'minimal'
}

// Get render settings for a quality level
// Performance-optimized: Capped DPR to 1.5 max to prevent GPU bottleneck
const getRenderSettings = (level: QualityLevel): RenderSettings => {
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
        // Desktop renders up to DPR 2 for crisp definition — the FPS
        // auto-degradation monitor drops quality if 60fps can't be held.
        // Mobile stays capped at 1.5 where the extra pixels cost too much.
        dpr: Math.min(caps.nativeDpr, isMobile ? 1.5 : 2),
        antialias: !isMobile,
        powerPreference: 'high-performance',
        particleMultiplier: isMobile ? 0.5 : 1,
        segmentMultiplier: 1,
        targetFPS: 60,
        // More lights for better illumination
        lightCount: isMobile ? 4 : 6
      }
  }
}

// Global state
const quality = ref<QualityLevel>(detectQuality())
const deviceCapabilities = detectDeviceCapabilities()

// Computed render settings that update when quality changes
const renderSettings = computed<RenderSettings>(() => getRenderSettings(quality.value))

// Persist only EXPLICIT user choices (setQuality/cycleQuality). Auto-degraded
// levels stay session-only: one janky visit (battery saver, busy machine)
// must not permanently lock the user out of high quality.
const persistQuality = (level: QualityLevel) => {
  localStorage.setItem(STORAGE_KEY, level)
}

// FPS monitoring for auto-degradation
let fpsHistory: number[] = []
let lastFrameTime = performance.now()
let fpsMonitorEnabled = false
let animationFrameId: number | null = null
let lastDegradeTime = 0

// RAF pauses while the tab is hidden, so the first sample after returning is
// a multi-second delta (≈0.5 FPS). Feeding those into the history used to
// trip the degradation checks on EVERY tab switch, rebuilding all scenes with
// a visible flash. Outlier deltas are discarded instead.
const MAX_SAMPLE_DELTA = 250
// Grace period after a degradation so one hitch can't cascade straight from
// high to minimal before the cheaper tier has had a chance to stabilise.
const DEGRADE_COOLDOWN_MS = 3000

const degradeOneStep = (now: number) => {
  if (quality.value === 'high') quality.value = 'low'
  else if (quality.value === 'low') quality.value = 'minimal'
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

    // Keep last 60 frames
    if (fpsHistory.length > 60) {
      fpsHistory.shift()
    }

    // Check for auto-degradation after collecting enough samples
    if (fpsHistory.length >= 30 && now - lastDegradeTime > DEGRADE_COOLDOWN_MS) {
      const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length

      // Auto-degrade if FPS is consistently low
      const targetFPS = getRenderSettings(quality.value).targetFPS
      const threshold = targetFPS * 0.7 // Degrade if below 70% of target

      if (avgFPS < threshold && quality.value !== 'minimal') {
        degradeOneStep(now)
      } else {
        // Thermal throttling detection - if FPS drops suddenly and stays low
        const recentFPS = fpsHistory.slice(-10)
        const recentAvg = recentFPS.reduce((a, b) => a + b, 0) / recentFPS.length
        const earlierFPS = fpsHistory.slice(-30, -10)
        if (earlierFPS.length > 0) {
          const earlierAvg = earlierFPS.reduce((a, b) => a + b, 0) / earlierFPS.length
          if (earlierAvg > 0 && recentAvg < earlierAvg * 0.7 && quality.value !== 'minimal') {
            degradeOneStep(now)
          }
        }
      }
    }
  }

  animationFrameId = requestAnimationFrame(measureFPS)
}

export function useQuality() {
  const cycleQuality = () => {
    const levels: QualityLevel[] = ['minimal', 'low', 'high']
    const currentIndex = levels.indexOf(quality.value)
    const nextIndex = (currentIndex + 1) % levels.length
    quality.value = levels[nextIndex]
    persistQuality(quality.value)
    return quality.value
  }

  const setQuality = (level: QualityLevel) => {
    quality.value = level
    persistQuality(level)
  }
  
  const isHighQuality = () => quality.value === 'high'
  const isMinimalQuality = () => quality.value === 'minimal'
  
  const startFPSMonitoring = () => {
    if (!fpsMonitorEnabled) {
      fpsMonitorEnabled = true
      fpsHistory = []
      lastFrameTime = performance.now()
      measureFPS()
    }
  }
  
  const stopFPSMonitoring = () => {
    fpsMonitorEnabled = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
  
  const getAverageFPS = () => {
    if (fpsHistory.length === 0) return 0
    return fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length
  }
  
  return {
    quality,
    renderSettings,
    deviceCapabilities,
    cycleQuality,
    setQuality,
    isHighQuality,
    isMinimalQuality,
    startFPSMonitoring,
    stopFPSMonitoring,
    getAverageFPS
  }
}
