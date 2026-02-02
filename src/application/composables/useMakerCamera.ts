import { reactive, ref } from 'vue'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export type CameraMode = 'rack' | 'desk'

export function useMakerCamera(cameraOffset: CameraOffset) {
  // Camera mode state
  const cameraMode = ref<CameraMode>('desk')

  // Desk mode camera positions (default/original)
  const deskCameraPos = { x: -2, y: 0.925, z: 4.5 }
  const deskLookAt = { x: -2, y: 0.925, z: 0.285 }

  // Rack mode camera positions (close-up view)
  const rackCameraPos = { x: 2.5, y: 1.5, z: 5.5 }
  const rackLookAt = { x: 1.372, y: 0, z: 0.5 }

  // Target positions for smooth transitions
  const targetCameraPos = reactive({ x: deskCameraPos.x, y: deskCameraPos.y, z: deskCameraPos.z })
  const targetLookAt = reactive({ x: deskLookAt.x, y: deskLookAt.y, z: deskLookAt.z })

  // Reactive camera position and look-at
  const cameraPosition = reactive({ x: deskCameraPos.x, y: deskCameraPos.y, z: deskCameraPos.z })
  const cameraLookAt = reactive({ x: deskLookAt.x, y: deskLookAt.y, z: deskLookAt.z })

  // Switch camera mode
  const switchMode = (mode: CameraMode) => {
    if (cameraMode.value === mode) return
    cameraMode.value = mode

    if (mode === 'rack') {
      targetCameraPos.x = rackCameraPos.x
      targetCameraPos.y = rackCameraPos.y
      targetCameraPos.z = rackCameraPos.z
      targetLookAt.x = rackLookAt.x
      targetLookAt.y = rackLookAt.y
      targetLookAt.z = rackLookAt.z
    } else {
      targetCameraPos.x = deskCameraPos.x
      targetCameraPos.y = deskCameraPos.y
      targetCameraPos.z = deskCameraPos.z
      targetLookAt.x = deskLookAt.x
      targetLookAt.y = deskLookAt.y
      targetLookAt.z = deskLookAt.z
    }
  }

  // Toggle between modes
  const toggleMode = () => {
    switchMode(cameraMode.value === 'rack' ? 'desk' : 'rack')
  }

  const updateCamera = (elapsed: number) => {
    // Smooth interpolation for mouse-based offset (only in desk mode)
    if (cameraMode.value === 'desk') {
      cameraOffset.x += (cameraOffset.targetX - cameraOffset.x) * 0.1
      cameraOffset.y += (cameraOffset.targetY - cameraOffset.y) * 0.1
    } else {
      // Reset offset in rack mode
      cameraOffset.x = 0
      cameraOffset.y = 0
      cameraOffset.targetX = 0
      cameraOffset.targetY = 0
    }

    // Calculate desired camera position based on mode
    let desiredPos = { x: targetCameraPos.x, y: targetCameraPos.y, z: targetCameraPos.z }
    let desiredLookAt = { x: targetLookAt.x, y: targetLookAt.y, z: targetLookAt.z }

    // Only apply automatic animation in desk mode
    if (cameraMode.value === 'desk') {
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

      // Calculate desired camera position with animation
      desiredPos.x = targetCameraPos.x + autoX + userOffsetX
      desiredPos.y = targetCameraPos.y + breathing + userOffsetY
      desiredPos.z = targetCameraPos.z + autoZ

      // Look at point with slight offset based on mouse
      desiredLookAt.x = targetLookAt.x + cameraOffset.x * 0.15
      desiredLookAt.y = targetLookAt.y + cameraOffset.y * 0.1
      desiredLookAt.z = targetLookAt.z
    }

    // Smooth interpolation to desired position (for mode switching and animation)
    const transitionSpeed = 0.05
    cameraPosition.x += (desiredPos.x - cameraPosition.x) * transitionSpeed
    cameraPosition.y += (desiredPos.y - cameraPosition.y) * transitionSpeed
    cameraPosition.z += (desiredPos.z - cameraPosition.z) * transitionSpeed
    cameraLookAt.x += (desiredLookAt.x - cameraLookAt.x) * transitionSpeed
    cameraLookAt.y += (desiredLookAt.y - cameraLookAt.y) * transitionSpeed
    cameraLookAt.z += (desiredLookAt.z - cameraLookAt.z) * transitionSpeed
  }

  return {
    cameraPosition,
    cameraLookAt,
    cameraMode,
    updateCamera,
    switchMode,
    toggleMode
  }
}

