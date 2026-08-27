import { useCallback, useRef } from 'react'
import type { RefObject } from 'react'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerAnimations(
  sceneRef: RefObject<any>,
  _cameraOffset: CameraOffset,
  updateCamera: (elapsed: number, delta: number) => void
) {
  // PERFORMANCE: plain mutable object (the Vue version used markRaw) so
  // per-frame writes never trigger React re-renders
  const animRef = useRef({
    time: 0,
    fanRotation: 0
  })
  const anim = animRef.current

  // Latest updateCamera in a ref so the stable callback never goes stale
  const updateCameraRef = useRef(updateCamera)
  updateCameraRef.current = updateCamera

  const updateAnimations = useCallback((elapsed: number, delta: number) => {
    anim.time = elapsed
    anim.fanRotation = elapsed * 8

    // Scene subtle movement
    if (sceneRef.current) {
      sceneRef.current.rotation.y = Math.sin(elapsed * 0.04) * 0.06
      sceneRef.current.position.y = Math.sin(elapsed * 0.1) * 0.02
    }

    // Update camera
    updateCameraRef.current(elapsed, delta)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    anim,
    updateAnimations
  }
}
