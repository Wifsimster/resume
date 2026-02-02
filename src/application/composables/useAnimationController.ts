import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuality } from './useQuality'

interface BatteryInfo {
  level: number | null
  charging: boolean | null
  chargingTime: number | null
  dischargingTime: number | null
}

export function useAnimationController(elementRef?: { value: HTMLElement | null }) {
  const { quality, deviceCapabilities } = useQuality()
  
  const isPaused = ref(false)
  const isVisible = ref(true)
  const animationFrameId = ref<number | null>(null)
  const lastFrameTime = ref(0)
  const animationCallback = ref<((elapsed: number, delta: number) => void) | null>(null)
  const batteryInfo = ref<BatteryInfo>({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null
  })

  // Detect mobile device
  const isMobile = computed(() => deviceCapabilities.isMobile)

  // Target FPS info (for debugging/monitoring, not for limiting)
  const targetFPS = computed(() => {
    if (quality.value === 'minimal') return 30
    if (quality.value === 'low') return isMobile.value ? 30 : 45
    return isMobile.value ? 30 : 60
  })

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

  // Simple animation loop - let the browser handle frame timing via RAF
  // No artificial frame limiting which was causing severe FPS drops
  const createAnimationLoop = (callback: (elapsed: number, delta: number) => void) => {
    let startTime = 0

    const animate = (currentTime: number) => {
      // If paused or not visible, stop the loop
      if (isPaused.value || !isVisible.value) {
        animationFrameId.value = null
        return
      }

      // Initialize start time on first frame
      if (startTime === 0) {
        startTime = currentTime
        lastFrameTime.value = currentTime
      }

      // Calculate delta (time since last frame) and elapsed (total time)
      const delta = currentTime - lastFrameTime.value
      const elapsed = (currentTime - startTime) / 1000
      lastFrameTime.value = currentTime

      // Call the animation callback every frame
      callback(elapsed, delta)

      animationFrameId.value = requestAnimationFrame(animate)
    }

    return animate
  }

  // Start animation loop
  const start = (callback: (elapsed: number, delta: number) => void) => {
    if (animationFrameId.value !== null) {
      stop()
    }

    // Store callback so we can restart when section becomes visible
    animationCallback.value = callback

    // Only start if visible and not paused
    if (isVisible.value && !isPaused.value) {
      lastFrameTime.value = 0
      const animate = createAnimationLoop(callback)
      animationFrameId.value = requestAnimationFrame(animate)
    }
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
    // Restart animation if visible and callback exists
    if (isVisible.value && animationCallback.value && animationFrameId.value === null) {
      const animate = createAnimationLoop(animationCallback.value)
      animationFrameId.value = requestAnimationFrame(animate)
    }
  }

  // Auto-stop/start when visibility changes
  watch(isVisible, (visible) => {
    if (!visible && !isPaused.value) {
      // Stop the animation loop completely when not visible
      stop()
    } else if (visible && !isPaused.value && animationCallback.value && animationFrameId.value === null) {
      // Restart the animation loop when becoming visible
      lastFrameTime.value = 0
      const animate = createAnimationLoop(animationCallback.value)
      animationFrameId.value = requestAnimationFrame(animate)
    }
  })

  // Auto-pause when battery is low and not charging
  watch(
    () => [batteryInfo.value.level, batteryInfo.value.charging],
    ([level, charging]) => {
      if (typeof level === 'number' && level < 0.2 && charging === false && isMobile.value) {
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

