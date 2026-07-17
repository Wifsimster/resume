import { markRaw, type Ref } from 'vue'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerAnimations(
  sceneRef: Ref<any>,
  _cameraOffset: CameraOffset,
  updateCamera: (elapsed: number, delta: number) => void
) {
  // PERFORMANCE: Use markRaw to prevent Vue from tracking changes
  // This avoids triggering re-renders every frame when animation values change
  const anim = markRaw({
    time: 0,
    fanRotation: 0
  })

  const updateAnimations = (elapsed: number, delta: number) => {
    anim.time = elapsed
    anim.fanRotation = elapsed * 8

    // Scene subtle movement
    if (sceneRef.value) {
      sceneRef.value.rotation.y = Math.sin(elapsed * 0.04) * 0.06
      sceneRef.value.position.y = Math.sin(elapsed * 0.1) * 0.02
    }

    // Update camera
    updateCamera(elapsed, delta)
  }

  return {
    anim,
    updateAnimations
  }
}
