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
    if (!elementRef?.value || intersectionObserver) return

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

  // Scene clock. `elapsedMs` accumulates only while the loop actually runs and
  // survives visibility pauses, so a scene scrolled out of view resumes exactly
  // where it stopped instead of snapping back to t=0. Deriving elapsed from the
  // (clamped) deltas also keeps it continuous across tab switches, where RAF
  // stops firing and the next raw timestamp would otherwise jump seconds ahead.
  const MAX_DELTA_MS = 100
  let elapsedMs = 0
  let lastTimestamp: number | null = null

  const createAnimationLoop = (callback: (elapsed: number, delta: number) => void) => {
    const animate = (currentTime: number) => {
      // If paused or not visible, stop the loop
      if (isPaused.value || !isVisible.value) {
        animationFrameId.value = null
        lastTimestamp = null
        return
      }

      if (lastTimestamp === null) lastTimestamp = currentTime
      const delta = Math.min(currentTime - lastTimestamp, MAX_DELTA_MS)
      lastTimestamp = currentTime
      elapsedMs += delta

      // Call the animation callback every frame
      callback(elapsedMs / 1000, delta)

      animationFrameId.value = requestAnimationFrame(animate)
    }

    return animate
  }

  // Start animation loop (fresh clock — used once per scene mount)
  const start = (callback: (elapsed: number, delta: number) => void) => {
    if (animationFrameId.value !== null) {
      stop()
    }

    // Store callback so we can restart when section becomes visible
    animationCallback.value = callback
    elapsedMs = 0

    // Only start if visible and not paused
    if (isVisible.value && !isPaused.value) {
      const animate = createAnimationLoop(callback)
      animationFrameId.value = requestAnimationFrame(animate)
    }
  }

  // Stop animation loop (keeps the accumulated clock for a later restart)
  const stop = () => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
    lastTimestamp = null
  }

  // Restart the loop if it is eligible to run and not already running
  const restartIfIdle = () => {
    if (isVisible.value && !isPaused.value && animationCallback.value && animationFrameId.value === null) {
      const animate = createAnimationLoop(animationCallback.value)
      animationFrameId.value = requestAnimationFrame(animate)
    }
  }

  // Pause/resume
  const pause = () => {
    isPaused.value = true
  }

  const resume = () => {
    isPaused.value = false
    restartIfIdle()
  }

  // Auto-stop/start when visibility changes
  watch(isVisible, (visible) => {
    if (!visible && !isPaused.value) {
      // Stop the animation loop completely when not visible
      stop()
    } else if (visible) {
      // Restart the animation loop when becoming visible
      restartIfIdle()
    }
  })

  // Set up the visibility observer as soon as the element is available.
  // Scenes assign their section element inside their own onMounted, which runs
  // AFTER this composable's onMounted, so observing eagerly here would miss it
  // and visibility-based pausing would silently never work. Watching the ref
  // guarantees the observer is attached the moment the element appears.
  if (elementRef) {
    watch(
      () => elementRef.value,
      (el) => {
        if (el) setupVisibilityObserver()
      },
      { immediate: true }
    )
  }

  // Initialize
  onMounted(() => {
    detectBattery()
    setupVisibilityObserver()
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

