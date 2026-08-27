import { useCallback, useEffect, useRef, useState } from 'react'

export function useFPS() {
  const [fps, setFps] = useState(0)
  const [enabled, setEnabled] = useState(false)

  const enabledRef = useRef(false)
  const lastTimeRef = useRef(performance.now())
  const frameCountRef = useRef(0)
  const animationFrameIdRef = useRef<number | null>(null)

  const updateFPS = useCallback(() => {
    if (!enabledRef.current) return

    frameCountRef.current++
    const currentTime = performance.now()
    const delta = currentTime - lastTimeRef.current

    // Update FPS every second
    if (delta >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / delta))
      frameCountRef.current = 0
      lastTimeRef.current = currentTime
    }

    animationFrameIdRef.current = requestAnimationFrame(updateFPS)
  }, [])

  const start = useCallback(() => {
    if (enabledRef.current) return
    enabledRef.current = true
    setEnabled(true)
    lastTimeRef.current = performance.now()
    frameCountRef.current = 0
    setFps(0)
    animationFrameIdRef.current = requestAnimationFrame(updateFPS)
  }, [updateFPS])

  const stop = useCallback(() => {
    enabledRef.current = false
    setEnabled(false)
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
    setFps(0)
  }, [])

  // Stop the loop when the owning component unmounts
  useEffect(() => {
    return () => {
      enabledRef.current = false
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }
    }
  }, [])

  return {
    fps,
    enabled,
    start,
    stop
  }
}
