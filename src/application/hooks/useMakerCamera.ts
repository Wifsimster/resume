import { useCallback, useRef } from 'react'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export type CameraMode = 'rack' | 'desk'

const deskCameraPos = { x: -2, y: 0.925, z: 4.5 }
const deskLookAt = { x: -2, y: 0.925, z: 0.285 }

const rackCameraPos = { x: 1.372, y: 1.5, z: 5.5 }
const rackLookAt = { x: 1.372, y: 0, z: 0.5 }

export function useMakerCamera(cameraOffset: CameraOffset, cameraMode: CameraMode) {
  const cameraModeRef = useRef(cameraMode)
  cameraModeRef.current = cameraMode

  const cameraPositionRef = useRef({ x: deskCameraPos.x, y: deskCameraPos.y, z: deskCameraPos.z })
  const cameraLookAtRef = useRef({ x: deskLookAt.x, y: deskLookAt.y, z: deskLookAt.z })

  const lastModeRef = useRef<CameraMode | null>(null)

  const updateCamera = useCallback((elapsed: number, delta: number) => {
    const cameraPosition = cameraPositionRef.current
    const cameraLookAt = cameraLookAtRef.current

    if (cameraModeRef.current === 'desk') {
      lastModeRef.current = 'desk'

      const smoothing = 1 - Math.exp(-delta * 0.0063)
      cameraOffset.x += (cameraOffset.targetX - cameraOffset.x) * smoothing
      cameraOffset.y += (cameraOffset.targetY - cameraOffset.y) * smoothing

      const orbitRadius = 0.8
      const orbitSpeed = 0.15
      const autoX = Math.sin(elapsed * orbitSpeed) * orbitRadius
      const autoZ = Math.cos(elapsed * orbitSpeed) * orbitRadius

      const breathing = Math.sin(elapsed * 0.3) * 0.15

      const userOffsetX = cameraOffset.x * 0.3
      const userOffsetY = cameraOffset.y * 0.2

      cameraPosition.x = deskCameraPos.x + autoX + userOffsetX
      cameraPosition.y = deskCameraPos.y + breathing + userOffsetY
      cameraPosition.z = deskCameraPos.z + autoZ

      cameraLookAt.x = deskLookAt.x + cameraOffset.x * 0.15
      cameraLookAt.y = deskLookAt.y + cameraOffset.y * 0.1
      cameraLookAt.z = deskLookAt.z
    } else if (lastModeRef.current !== 'rack') {
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
