import { markRaw, type Ref } from 'vue'
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
  _cameraOffset: CameraOffset,
  updateCamera: (elapsed: number) => void
) {
  // PERFORMANCE: Use markRaw to prevent Vue from tracking changes
  // This avoids triggering re-renders every frame when animation values change
  const MAX_UNITS = 12
  const anim = markRaw({
    time: 0,
    serverLeds: new Array(MAX_UNITS).fill(0.15) as number[],
    fanRotation: 0,
    hddActivity: 0,
    screenFlicker: [1, 1, 1] as number[]
  })

  const updateAnimations = (elapsed: number, _delta: number) => {
    anim.time = elapsed

    // Server LEDs blinking pattern - mutate in-place, no array allocation
    const units = visibleRackUnits.value
    for (let i = 0; i < units.length; i++) {
      anim.serverLeds[i] = Math.sin(elapsed * (2 + i * 0.5) + i * 1.5) > 0.2 ? 1 : 0.15
    }

    // Fan rotation
    anim.fanRotation = elapsed * 8

    // HDD activity
    anim.hddActivity = Math.random() > 0.7 ? 1 : 0.1

    // Screen subtle flicker - mutate in-place, no array allocation
    anim.screenFlicker[0] = 0.95 + Math.sin(elapsed * 0.5) * 0.05
    anim.screenFlicker[1] = 0.95 + Math.sin(elapsed * 0.7 + 1) * 0.05
    anim.screenFlicker[2] = 0.95 + Math.sin(elapsed * 0.6 + 2) * 0.05

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

