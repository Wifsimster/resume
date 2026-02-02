import { reactive, type Ref } from 'vue'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export type CameraMode = 'rack' | 'desk'

export function useMakerCamera(cameraOffset: CameraOffset, cameraMode: Ref<CameraMode>) {
  // Desk mode camera positions
  const deskCameraPos = { x: -2, y: 0.925, z: 4.5 }
  const deskLookAt = { x: -2, y: 0.925, z: 0.285 }

  // Rack mode camera positions (centered in front of rack at x=1.372)
  const rackCameraPos = { x: 1.372, y: 1.5, z: 5.5 }
  const rackLookAt = { x: 1.372, y: 0, z: 0.5 }

  // Reactive camera position and look-at
  const cameraPosition = reactive({ x: deskCameraPos.x, y: deskCameraPos.y, z: deskCameraPos.z })
  const cameraLookAt = reactive({ x: deskLookAt.x, y: deskLookAt.y, z: deskLookAt.z })

  // Track last mode to avoid redundant per-frame writes in rack mode
  let lastMode: CameraMode | null = null

  const updateCamera = (elapsed: number) => {
    if (cameraMode.value === 'desk') {
      lastMode = 'desk'

      // Smooth interpolation for mouse-based offset
      cameraOffset.x += (cameraOffset.targetX - cameraOffset.x) * 0.1
      cameraOffset.y += (cameraOffset.targetY - cameraOffset.y) * 0.1

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
    } else if (lastMode !== 'rack') {
      // Rack mode: set static camera only once on mode change
      lastMode = 'rack'

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
  }

  return {
    cameraPosition,
    cameraLookAt,
    updateCamera
  }
}

