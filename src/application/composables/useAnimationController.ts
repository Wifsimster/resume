import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuality } from './useQuality'

interface BatteryInfo {
  level: number | null
  charging: boolean | null
  chargingTime: number | null
  dischargingTime: number | null
}

export function useAnimationController(elementRef?: { value: HTMLElement | null }) {
  const { quality, deviceCapabilities, renderSettings } = useQuality()
  
  const isPaused = ref(false)
  const isVisible = ref(true)
  const animationFrameId = ref<number | null>(null)
  const lastFrameTime = ref(0)
  const batteryInfo = ref<BatteryInfo>({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null
  })

  // Detect mobile device
  const isMobile = computed(() => deviceCapabilities.isMobile)
  
  // Target FPS based on device and quality
  const targetFPS = computed(() => {
    if (quality.value === 'minimal') return 30
    if (quality.value === 'low') return isMobile.value ? 30 : 45
    return isMobile.value ? 30 : 60
  })

  const frameInterval = computed(() => 1000 / targetFPS.value)

  // Battery API detection
  const detectBattery = async () => {
    try {
      const batteryPromise = (navigator as any).getBattery?.()
      const battery = batteryPromise 
        ? await batteryPromise 
        : (navigator as any).battery
      
      if (battery) {
        const updateBatteryInfo = () => {
          batteryInfo.value = {
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          }
        }
        
        updateBatteryInfo()
        battery.addEventListener('chargingchange', updateBatteryInfo)
        battery.addEventListener('levelchange', updateBatteryInfo)
        battery.addEventListener('chargingtimechange', updateBatteryInfo)
        battery.addEventListener('dischargingtimechange', updateBatteryInfo)
      }
    } catch {
      // Battery API not available
    }
  }

  // IntersectionObserver for visibility detection
  let intersectionObserver: IntersectionObserver | null = null

  const setupVisibilityObserver = () => {
    if (!elementRef?.value) return

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Pause when section is less than 10% visible
          isVisible.value = entry.intersectionRatio >= 0.1
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start animating slightly before fully visible
      }
    )

    intersectionObserver.observe(elementRef.value)
  }

  // Frame rate limiter
  const createAnimationLoop = (callback: (elapsed: number, delta: number) => void) => {
    let accumulatedTime = 0
    const targetDelta = frameInterval.value

    const animate = (currentTime: number) => {
      if (isPaused.value || !isVisible.value) {
        animationFrameId.value = requestAnimationFrame(animate)
        return
      }

      if (lastFrameTime.value === 0) {
        lastFrameTime.value = currentTime
      }

      const delta = currentTime - lastFrameTime.value
      lastFrameTime.value = currentTime
      accumulatedTime += delta

      // Update at target frame rate
      if (accumulatedTime >= targetDelta) {
        const elapsed = (currentTime - (lastFrameTime.value - accumulatedTime)) / 1000
        callback(elapsed, accumulatedTime)
        accumulatedTime = 0
      }

      animationFrameId.value = requestAnimationFrame(animate)
    }

    return animate
  }

  // Start animation loop
  const start = (callback: (elapsed: number, delta: number) => void) => {
    if (animationFrameId.value !== null) {
      stop()
    }

    lastFrameTime.value = 0
    const animate = createAnimationLoop(callback)
    animationFrameId.value = requestAnimationFrame(animate)
  }

  // Stop animation loop
  const stop = () => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
    lastFrameTime.value = 0
  }

  // Pause/resume
  const pause = () => {
    isPaused.value = true
  }

  const resume = () => {
    isPaused.value = false
    lastFrameTime.value = 0 // Reset timing on resume
  }

  // Auto-pause when not visible
  watch(isVisible, (visible) => {
    if (!visible && !isPaused.value) {
      // Don't pause, just let the loop skip updates
    }
  })

  // Auto-pause when battery is low and not charging
  watch(
    () => [batteryInfo.value.level, batteryInfo.value.charging],
    ([level, charging]) => {
      if (level !== null && level < 0.2 && !charging && isMobile.value) {
        // Reduce quality when battery is low
        if (quality.value === 'high') {
          // Quality will be auto-degraded by FPS monitoring
        }
      }
    }
  )

  // Initialize
  onMounted(() => {
    detectBattery()
    if (elementRef?.value) {
      setupVisibilityObserver()
    }
  })

  onBeforeUnmount(() => {
    stop()
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
  })

  return {
    isPaused,
    isVisible,
    isMobile,
    targetFPS,
    batteryInfo,
    start,
    stop,
    pause,
    resume
  }
}

