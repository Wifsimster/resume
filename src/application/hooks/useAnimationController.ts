import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useQuality } from '@application/stores/quality'

interface BatteryInfo {
  level: number | null
  charging: boolean | null
  chargingTime: number | null
  dischargingTime: number | null
}

type AnimationCallback = (elapsed: number, delta: number) => void

export function useAnimationController(elementRef?: RefObject<HTMLElement | null>) {
  const { quality, deviceCapabilities } = useQuality()

  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null
  })

  // Loop internals live in refs: the RAF loop must read the CURRENT pause /
  // visibility flags, not the ones captured when start() was called.
  const isPausedRef = useRef(false)
  const isVisibleRef = useRef(true)
  const animationFrameIdRef = useRef<number | null>(null)
  const animationCallbackRef = useRef<AnimationCallback | null>(null)

  // Detect mobile device
  const isMobile = deviceCapabilities.isMobile

  // Target FPS info (for debugging/monitoring, not for limiting)
  const targetFPS = useMemo(() => {
    if (quality === 'minimal') return 30
    if (quality === 'low') return isMobile ? 30 : 45
    return isMobile ? 30 : 60
  }, [quality, isMobile])

  // Scene clock. `elapsedMs` accumulates only while the loop actually runs and
  // survives visibility pauses, so a scene scrolled out of view resumes exactly
  // where it stopped instead of snapping back to t=0. Deriving elapsed from the
  // (clamped) deltas also keeps it continuous across tab switches, where RAF
  // stops firing and the next raw timestamp would otherwise jump seconds ahead.
  const MAX_DELTA_MS = 100
  const elapsedMsRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)

  const runLoop = useCallback((callback: AnimationCallback) => {
    const animate = (currentTime: number) => {
      // If paused or not visible, stop the loop
      if (isPausedRef.current || !isVisibleRef.current) {
        animationFrameIdRef.current = null
        lastTimestampRef.current = null
        return
      }

      if (lastTimestampRef.current === null) lastTimestampRef.current = currentTime
      const delta = Math.min(currentTime - lastTimestampRef.current, MAX_DELTA_MS)
      lastTimestampRef.current = currentTime
      elapsedMsRef.current += delta

      // Call the animation callback every frame
      callback(elapsedMsRef.current / 1000, delta)

      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    animationFrameIdRef.current = requestAnimationFrame(animate)
  }, [])

  // Stop animation loop (keeps the accumulated clock for a later restart)
  const stop = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
    lastTimestampRef.current = null
  }, [])

  // Start animation loop (fresh clock — used once per scene mount)
  const start = useCallback((callback: AnimationCallback) => {
    if (animationFrameIdRef.current !== null) {
      stop()
    }

    // Store callback so we can restart when section becomes visible
    animationCallbackRef.current = callback
    elapsedMsRef.current = 0

    // Only start if visible and not paused
    if (isVisibleRef.current && !isPausedRef.current) {
      runLoop(callback)
    }
  }, [runLoop, stop])

  // Restart the loop if it is eligible to run and not already running
  const restartIfIdle = useCallback(() => {
    if (isVisibleRef.current && !isPausedRef.current && animationCallbackRef.current && animationFrameIdRef.current === null) {
      runLoop(animationCallbackRef.current)
    }
  }, [runLoop])

  // Pause/resume
  const pause = useCallback(() => {
    isPausedRef.current = true
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    isPausedRef.current = false
    setIsPaused(false)
    restartIfIdle()
  }, [restartIfIdle])

  // Battery API detection
  useEffect(() => {
    let disposed = false
    const detectBattery = async () => {
      try {
        const nav = navigator as unknown as { getBattery?: () => Promise<any>, battery?: any }
        const battery = nav.getBattery ? await nav.getBattery() : nav.battery

        if (battery && !disposed) {
          const updateBatteryInfo = () => {
            setBatteryInfo({
              level: battery.level,
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime
            })
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
    detectBattery()
    return () => { disposed = true }
  }, [])

  // IntersectionObserver for visibility detection — auto-stops/starts the loop
  // when the observed section scrolls out of / back into view.
  useEffect(() => {
    const el = elementRef?.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Pause when section is less than 10% visible
          const visible = entry.intersectionRatio >= 0.1
          isVisibleRef.current = visible
          setIsVisible(visible)

          if (!visible && !isPausedRef.current) {
            // Stop the animation loop completely when not visible
            stop()
          } else if (visible) {
            // Restart the animation loop when becoming visible
            restartIfIdle()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start animating slightly before fully visible
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
     
  }, [elementRef, restartIfIdle, stop])

  // Stop the loop on unmount
  useEffect(() => stop, [stop])

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
