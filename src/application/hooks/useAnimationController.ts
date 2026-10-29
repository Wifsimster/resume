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

  const isPausedRef = useRef(false)
  const isVisibleRef = useRef(true)
  const animationFrameIdRef = useRef<number | null>(null)
  const animationCallbackRef = useRef<AnimationCallback | null>(null)

  const isMobile = deviceCapabilities.isMobile

  const targetFPS = useMemo(() => {
    if (quality === 'minimal') return 30
    if (quality === 'low') return isMobile ? 30 : 45
    return isMobile ? 30 : 60
  }, [quality, isMobile])

  const MAX_DELTA_MS = 100
  const elapsedMsRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)

  const runLoop = useCallback((callback: AnimationCallback) => {
    const animate = (currentTime: number) => {
      if (isPausedRef.current || !isVisibleRef.current) {
        animationFrameIdRef.current = null
        lastTimestampRef.current = null
        return
      }

      if (lastTimestampRef.current === null) lastTimestampRef.current = currentTime
      const delta = Math.min(currentTime - lastTimestampRef.current, MAX_DELTA_MS)
      lastTimestampRef.current = currentTime
      elapsedMsRef.current += delta

      callback(elapsedMsRef.current / 1000, delta)

      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    animationFrameIdRef.current = requestAnimationFrame(animate)
  }, [])

  const stop = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
    lastTimestampRef.current = null
  }, [])

  const start = useCallback((callback: AnimationCallback) => {
    if (animationFrameIdRef.current !== null) {
      stop()
    }

    animationCallbackRef.current = callback
    elapsedMsRef.current = 0

    if (isVisibleRef.current && !isPausedRef.current) {
      runLoop(callback)
    }
  }, [runLoop, stop])

  const restartIfIdle = useCallback(() => {
    if (isVisibleRef.current && !isPausedRef.current && animationCallbackRef.current && animationFrameIdRef.current === null) {
      runLoop(animationCallbackRef.current)
    }
  }, [runLoop])

  const pause = useCallback(() => {
    isPausedRef.current = true
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    isPausedRef.current = false
    setIsPaused(false)
    restartIfIdle()
  }, [restartIfIdle])

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
      }
    }
    detectBattery()
    return () => { disposed = true }
  }, [])

  useEffect(() => {
    const el = elementRef?.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.intersectionRatio >= 0.1
          isVisibleRef.current = visible
          setIsVisible(visible)

          if (!visible && !isPausedRef.current) {
            stop()
          } else if (visible) {
            restartIfIdle()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
     
  }, [elementRef, restartIfIdle, stop])

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
