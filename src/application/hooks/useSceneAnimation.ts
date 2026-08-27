import { useEffect, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useAnimationController } from './useAnimationController'

/**
 * Wires a Three.js scene's render loop to a section element for
 * visibility-based pausing, and drives it with the animation controller's
 * own monotonic clock.
 *
 * This replaces the previous per-scene boilerplate that tracked `startTime`
 * with `Date.now()` and recomputed elapsed time every frame. The controller
 * already provides a high-resolution `elapsed` (seconds) and `delta`
 * (milliseconds), so scenes can stay purely declarative.
 *
 * Beyond the scene's own update callback, this also freezes the owning
 * Canvas's WebGL render loop while the section is off-screen. Each
 * section hosts its own canvas and R3F renders every canvas at full frame
 * rate regardless of visibility, so without this the GPU keeps compositing
 * every scene during scrolling and frames drop.
 *
 * @param sectionId  value of the `data-section` attribute on the owning
 *                   section, used to locate the element for the
 *                   IntersectionObserver that pauses off-screen scenes.
 * @param update     called once per visible frame with elapsed seconds and
 *                   the inter-frame delta in milliseconds.
 * @param onCleanup  optional hook to dispose scene-owned GPU resources.
 */
export function useSceneAnimation(
  sectionId: string,
  update: (elapsed: number, delta: number) => void,
  onCleanup?: () => void
) {
  const sectionElement = useRef<HTMLElement | null>(null)
  const controller = useAnimationController(sectionElement)

  // R3F equivalent of Tres's useLoop().start/stop: freeze the canvas's own
  // render loop while the section is off-screen or the controller is paused.
  const setFrameloop = useThree((state) => state.setFrameloop)
  useEffect(() => {
    if (controller.isVisible && !controller.isPaused) setFrameloop('always')
    else setFrameloop('never')
  }, [controller.isVisible, controller.isPaused, setFrameloop])

  // Locate the owning section in a layout effect so `sectionElement.current`
  // is populated BEFORE the controller's IntersectionObserver effect runs
  // (layout effects flush before passive effects).
  useLayoutEffect(() => {
    const el = document.querySelector(`[data-section="${sectionId}"]`)
    if (el) sectionElement.current = el as HTMLElement
  }, [sectionId])

  // Scenes re-create their `update` closure every render; route through refs so the
  // controller keeps a single registered callback that always sees the latest.
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
