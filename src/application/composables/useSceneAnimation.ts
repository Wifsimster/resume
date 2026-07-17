import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useLoop } from '@tresjs/core'
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
 * TresCanvas's WebGL render loop while the section is off-screen. Each
 * section hosts its own canvas and Tres renders every canvas at full frame
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
  const sectionElement = ref<HTMLElement | null>(null)
  const controller = useAnimationController(sectionElement)

  const { start: startRenderLoop, stop: stopRenderLoop } = useLoop()
  watch(
    [controller.isVisible, controller.isPaused],
    ([visible, paused]) => {
      if (visible && !paused) startRenderLoop()
      else stopRenderLoop()
    },
    { immediate: true }
  )

  onMounted(() => {
    const el = document.querySelector(`[data-section="${sectionId}"]`)
    if (el) sectionElement.value = el as HTMLElement
    controller.start(update)
  })

  onBeforeUnmount(() => {
    controller.stop()
    onCleanup?.()
  })

  return { controller, sectionElement }
}
