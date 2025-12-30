import { reactive, type Ref } from 'vue'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerCamera(cameraOffset: CameraOffset) {
  // Base camera position
  const baseCameraPos = { x: -1.5, y: 1.3, z: 5.5 }
  const baseLookAt = { x: -1, y: 1.6, z: 0 }

  // Reactive camera position and look-at
  const cameraPosition = reactive({ x: baseCameraPos.x, y: baseCameraPos.y, z: baseCameraPos.z })
  const cameraLookAt = reactive({ x: baseLookAt.x, y: baseLookAt.y, z: baseLookAt.z })

  const updateCamera = (elapsed: number) => {
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

    // Combine automatic animation with user offset (limited range)
    const userOffsetX = cameraOffset.x * 0.3 // Limit user control to 30% of automatic range
    const userOffsetY = cameraOffset.y * 0.2

    // Calculate final camera position
    cameraPosition.x = baseCameraPos.x + autoX + userOffsetX
    cameraPosition.y = baseCameraPos.y + breathing + userOffsetY
    cameraPosition.z = baseCameraPos.z + autoZ

    // Look at point with slight offset based on mouse
    cameraLookAt.x = baseLookAt.x + cameraOffset.x * 0.15
    cameraLookAt.y = baseLookAt.y + cameraOffset.y * 0.1
    cameraLookAt.z = baseLookAt.z
  }

  return {
    cameraPosition,
    cameraLookAt,
    updateCamera
  }
}

