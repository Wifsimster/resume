import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { Ref } from 'react'
import type { PerspectiveCamera } from 'three'

interface Props {
  position: [number, number, number]
  fov?: number
  lookAt?: [number, number, number]
  ref?: Ref<PerspectiveCamera>
}

// Minimal replacement for drei's <PerspectiveCamera makeDefault> — the only
// drei export this app used, and dropping the dependency keeps the three
// vendor chunk lean. Declares a camera, registers it as the scene's default
// and keeps its aspect in sync with the canvas size.
export default function SceneCamera({ position, fov = 45, lookAt, ref }: Props) {
  const cameraRef = useRef<PerspectiveCamera>(null)
  const set = useThree(state => state.set)
  const size = useThree(state => state.size)

  // Register as default camera (restore the previous one on unmount)
  useLayoutEffect(() => {
    const camera = cameraRef.current
    if (!camera) return
    if (lookAt) camera.lookAt(lookAt[0], lookAt[1], lookAt[2])
    set({ camera })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set])

  // Keep aspect in sync with the canvas (R3F only does this for its own
  // internal default camera)
  useLayoutEffect(() => {
    const camera = cameraRef.current
    if (!camera) return
    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()
  }, [size])

  return (
    <perspectiveCamera
      ref={(cam: PerspectiveCamera | null) => {
        cameraRef.current = cam
        if (typeof ref === 'function') ref(cam)
        else if (ref) ref.current = cam
      }}
      position={position}
      fov={fov}
    />
  )
}
