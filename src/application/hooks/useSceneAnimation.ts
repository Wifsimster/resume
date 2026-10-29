import { useEffect, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useAnimationController } from './useAnimationController'

export function useSceneAnimation(
  sectionId: string,
  update: (elapsed: number, delta: number) => void,
  onCleanup?: () => void
) {
  const sectionElement = useRef<HTMLElement | null>(null)
  const controller = useAnimationController(sectionElement)

  const setFrameloop = useThree((state) => state.setFrameloop)
  useEffect(() => {
    if (controller.isVisible && !controller.isPaused) setFrameloop('always')
    else setFrameloop('never')
  }, [controller.isVisible, controller.isPaused, setFrameloop])

  useLayoutEffect(() => {
    const el = document.querySelector(`[data-section="${sectionId}"]`)
    if (el) sectionElement.current = el as HTMLElement
  }, [sectionId])

  const updateRef = useRef(update)
  updateRef.current = update
  const onCleanupRef = useRef(onCleanup)
  onCleanupRef.current = onCleanup

  const { start, stop } = controller
  useEffect(() => {
    start((elapsed, delta) => updateRef.current(elapsed, delta))
    return () => {
      stop()
      onCleanupRef.current?.()
    }
  }, [start, stop])

  return { controller, sectionElement }
}
