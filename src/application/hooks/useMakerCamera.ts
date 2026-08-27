import { useCallback, useRef } from 'react'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export type CameraMode = 'rack' | 'desk'

// Desk mode camera positions
const deskCameraPos = { x: -2, y: 0.925, z: 4.5 }
const deskLookAt = { x: -2, y: 0.925, z: 0.285 }

// Rack mode camera positions (centered in front of rack at x=1.372)
const rackCameraPos = { x: 1.372, y: 1.5, z: 5.5 }
const rackLookAt = { x: 1.372, y: 0, z: 0.5 }

export function useMakerCamera(cameraOffset: CameraOffset, cameraMode: CameraMode) {
  // Latest mode in a ref so the per-frame callback always reads the current value
  const cameraModeRef = useRef(cameraMode)
  cameraModeRef.current = cameraMode

  // Mutable camera position and look-at (mutated per frame, read imperatively —
  // the Vue version used reactive objects, here consumers apply them in the
  // animation loop)
  const cameraPositionRef = useRef({ x: deskCameraPos.x, y: deskCameraPos.y, z: deskCameraPos.z })
  const cameraLookAtRef = useRef({ x: deskLookAt.x, y: deskLookAt.y, z: deskLookAt.z })

  // Track last mode to avoid redundant per-frame writes in rack mode
  const lastModeRef = useRef<CameraMode | null>(null)

  const updateCamera = useCallback((elapsed: number, delta: number) => {
    const cameraPosition = cameraPositionRef.current
    const cameraLookAt = cameraLookAtRef.current

    if (cameraModeRef.current === 'desk') {
      lastModeRef.current = 'desk'

      // Smooth interpolation for mouse-based offset, scaled by frame delta so
      // the easing speed is identical at 30, 60 or 144 Hz (~0.1/frame at 60Hz).
      const smoothing = 1 - Math.exp(-delta * 0.0063)
      cameraOffset.x += (cameraOffset.targetX - cameraOffset.x) * smoothing
      cameraOffset.y += (cameraOffset.targetY - cameraOffset.y) * smoothing

      // Automatic circular animation
      const orbitRadius = 0.8
      const orbitSpeed = 0.15
      const autoX = Math.sin(elapsed * orbitSpeed) * orbitRadius
      const autoZ = Math.cos(elapsed * orbitSpeed) * orbitRadius

      // Breathing effect (vertical)
      const breathing = Math.sin(elapsed * 0.3) * 0.15

      // Combine automatic animation with user offset
      const userOffsetX = cameraOffset.x * 0.3
      const userOffsetY = cameraOffset.y * 0.2

      cameraPosition.x = deskCameraPos.x + autoX + userOffsetX
      cameraPosition.y = deskCameraPos.y + breathing + userOffsetY
      cameraPosition.z = deskCameraPos.z + autoZ

      cameraLookAt.x = deskLookAt.x + cameraOffset.x * 0.15
      cameraLookAt.y = deskLookAt.y + cameraOffset.y * 0.1
      cameraLookAt.z = deskLookAt.z
    } else if (lastModeRef.current !== 'rack') {
      // Rack mode: set static camera only once on mode change
      lastModeRef.current = 'rack'

      cameraOffset.x = 0
      cameraOffset.y = 0
      cameraOffset.targetX = 0
      cameraOffset.targetY = 0

      cameraPosition.x = rackCameraPos.x
      cameraPosition.y = rackCameraPos.y
      cameraPosition.z = rackCameraPos.z
      cameraLookAt.x = rackLookAt.x
      cameraLookAt.y = rackLookAt.y
      cameraLookAt.z = rackLookAt.z
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    cameraPosition: cameraPositionRef.current,
    cameraLookAt: cameraLookAtRef.current,
    updateCamera
  }
}
