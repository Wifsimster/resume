import { reactive, computed, type Ref } from 'vue'
import type { ServerUnit } from '@domain/types/makerRack'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerAnimations(
  visibleRackUnits: Ref<ServerUnit[]>,
  sceneRef: Ref<any>,
  cameraOffset: CameraOffset,
  updateCamera: (elapsed: number) => void
) {
  const anim = reactive({
    time: 0,
    serverLeds: [] as number[],
    fanRotation: 0,
    hddActivity: 0,
    screenFlicker: [1] as number[]
  })

  const updateAnimations = (elapsed: number, _delta: number) => {
    anim.time = elapsed

    // Server LEDs blinking pattern (kept for compatibility)
    anim.serverLeds = visibleRackUnits.value.map((_, i) => {
      return Math.sin(elapsed * (2 + i * 0.5) + i * 1.5) > 0.2 ? 1 : 0.15
    })

    // Fan rotation
    anim.fanRotation = elapsed * 8

    // HDD activity
    anim.hddActivity = Math.random() > 0.7 ? 1 : 0.1

    // Screen subtle flicker
    anim.screenFlicker = [
      0.95 + Math.sin(elapsed * 0.5) * 0.05,
      0.95 + Math.sin(elapsed * 0.7 + 1) * 0.05,
      0.95 + Math.sin(elapsed * 0.6 + 2) * 0.05
    ]

    // Scene subtle movement
    if (sceneRef.value) {
      sceneRef.value.rotation.y = Math.sin(elapsed * 0.04) * 0.06
      sceneRef.value.position.y = Math.sin(elapsed * 0.1) * 0.02
    }

    // Update camera
    updateCamera(elapsed)
  }

  return {
    anim,
    updateAnimations
  }
}

