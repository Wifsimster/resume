import { ref, computed, watch } from 'vue'

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
  
  // Battery level consideration (if available)
  try {
    const battery = (navigator as any).getBattery?.() || (navigator as any).battery
    if (battery && !battery.charging && battery.level < 0.3) {
      score -= 1 // Reduce quality when battery is low and not charging
    }
  } catch {
    // Battery API not available
  }
  
  // Determine quality level
  if (score >= 5) return 'high'
  if (score >= 2) return 'low'
  return 'minimal'
}

// Get render settings for a quality level
const getRenderSettings = (level: QualityLevel): RenderSettings => {
  const caps = detectDeviceCapabilities()
  const isMobile = caps.isMobile
  
  switch (level) {
    case 'minimal':
      return {
        dpr: 1,
        antialias: false,
        powerPreference: 'low-power',
        particleMultiplier: isMobile ? 0.15 : 0.25,
        segmentMultiplier: isMobile ? 0.2 : 0.25,
        targetFPS: 30,
        lightCount: isMobile ? 2 : 3
      }
    case 'low':
      return {
        dpr: isMobile ? Math.min(caps.nativeDpr, 1.2) : Math.min(caps.nativeDpr, 1.5),
        antialias: false,
        powerPreference: isMobile ? 'low-power' : 'default',
        particleMultiplier: isMobile ? 0.35 : 0.5,
        segmentMultiplier: isMobile ? 0.4 : 0.5,
        targetFPS: isMobile ? 30 : 45,
        lightCount: isMobile ? 3 : 4
      }
    case 'high':
    default:
      return {
        dpr: isMobile ? Math.min(caps.nativeDpr, 1.5) : Math.min(caps.nativeDpr, 2.5),
        antialias: !isMobile, // Disable antialias on mobile for performance
        powerPreference: isMobile ? 'default' : 'high-performance',
        particleMultiplier: isMobile ? 0.8 : 1.5,
        segmentMultiplier: isMobile ? 0.9 : 1.5,
        targetFPS: isMobile ? 30 : 60,
        lightCount: isMobile ? 4 : 6
      }
  }
}

// Global state
const quality = ref<QualityLevel>(detectQuality())
const deviceCapabilities = detectDeviceCapabilities()

// Computed render settings that update when quality changes
const renderSettings = computed<RenderSettings>(() => getRenderSettings(quality.value))

// Save to localStorage when quality changes
watch(quality, (newQuality) => {
  localStorage.setItem(STORAGE_KEY, newQuality)
})

// FPS monitoring for auto-degradation
let fpsHistory: number[] = []
let lastFrameTime = performance.now()
let fpsMonitorEnabled = false
let animationFrameId: number | null = null

const measureFPS = () => {
  if (!fpsMonitorEnabled) return
  
  const now = performance.now()
  const delta = now - lastFrameTime
  lastFrameTime = now
  
  if (delta > 0) {
    const fps = 1000 / delta
    fpsHistory.push(fps)
    
    // Keep last 60 frames
    if (fpsHistory.length > 60) {
      fpsHistory.shift()
    }
    
    // Check for auto-degradation after collecting enough samples
    if (fpsHistory.length >= 30) {
      const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length
      
      // Auto-degrade if FPS is consistently low (more aggressive thresholds)
      const targetFPS = getRenderSettings(quality.value).targetFPS
      const threshold = targetFPS * 0.7 // Degrade if below 70% of target
      
      if (avgFPS < threshold && quality.value === 'high') {
        quality.value = 'low'
        fpsHistory = []
      } else if (avgFPS < threshold && quality.value === 'low') {
        quality.value = 'minimal'
        fpsHistory = []
      }
      
      // Thermal throttling detection - if FPS drops suddenly
      if (fpsHistory.length >= 10) {
        const recentFPS = fpsHistory.slice(-10)
        const recentAvg = recentFPS.reduce((a, b) => a + b, 0) / recentFPS.length
        const earlierFPS = fpsHistory.slice(-30, -10)
        if (earlierFPS.length > 0) {
          const earlierAvg = earlierFPS.reduce((a, b) => a + b, 0) / earlierFPS.length
          // If FPS dropped by more than 30%, likely thermal throttling
          if (earlierAvg > 0 && recentAvg < earlierAvg * 0.7) {
            // Degrade quality to reduce thermal load
            if (quality.value === 'high') {
              quality.value = 'low'
              fpsHistory = []
            } else if (quality.value === 'low') {
              quality.value = 'minimal'
              fpsHistory = []
            }
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
    return quality.value
  }
  
  const setQuality = (level: QualityLevel) => {
    quality.value = level
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
