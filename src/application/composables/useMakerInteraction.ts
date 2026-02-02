import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { Raycaster, Vector2 } from 'three'
import { useTres } from '@tresjs/core'
import type { CameraMode } from './useMakerCamera'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerInteraction(
  sceneRef: Ref<any>,
  cameraOffset: CameraOffset,
  cameraMode: Ref<CameraMode>,
  serverUnitMeshes: Ref<Map<string, any>>,
  onHoverChange: (unitId: string | null) => void
) {
  const hoveredUnitId = ref<string | null>(null)
  const { camera, renderer } = useTres()

  // Reset hover state when leaving rack mode
  watch(cameraMode, (newMode) => {
    if (newMode !== 'rack' && hoveredUnitId.value !== null) {
      hoveredUnitId.value = null
      onHoverChange(null)
    }
  })

  // Mouse position for raycasting
  const mouse = new Vector2()
  const raycasterInstance = new Raycaster()

  // Throttling for raycasting
  let rafId: number | null = null
  const lastMousePos = { x: 0, y: 0 }
  const MOUSE_MOVE_THRESHOLD = 0.01

  // Perform raycasting (throttled via requestAnimationFrame) - rack mode only
  const performRaycast = () => {
    const rendererInstance = (renderer as any).value
    if (!camera.value || !rendererInstance || !sceneRef.value) {
      rafId = null
      return
    }

    raycasterInstance.setFromCamera(mouse, camera.value)

    const meshes = Array.from(serverUnitMeshes.value.values())
      .map(mesh => mesh?.value || mesh)
      .filter(Boolean)

    if (meshes.length === 0) {
      rafId = null
      return
    }

    const intersects = raycasterInstance.intersectObjects(meshes, true)

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      let current = intersectedObject
      let unitId: string | null = null

      while (current && !unitId) {
        const currentObj = current
        unitId = Array.from(serverUnitMeshes.value.entries())
          .find(([_, mesh]) => {
            const meshObj = mesh?.value || mesh
            return meshObj === currentObj || (meshObj && meshObj.children && meshObj.children.includes(currentObj))
          })?.[0] || null
        // @ts-expect-error - parent can be null, but while loop handles it
        current = current.parent
      }

      if (unitId && unitId !== hoveredUnitId.value) {
        hoveredUnitId.value = unitId
        onHoverChange(unitId)
      }
    } else {
      if (hoveredUnitId.value !== null) {
        hoveredUnitId.value = null
        onHoverChange(null)
      }
    }

    rafId = null
  }

  const handleMouseMove = (event: MouseEvent) => {
    const rendererInstance = (renderer as any).value
    if (!camera.value || !rendererInstance || !sceneRef.value) return

    const canvas = rendererInstance.domElement
    const rect = canvas.getBoundingClientRect()

    const newMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const newMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Desk mode: update camera parallax offset
    if (cameraMode.value === 'desk') {
      cameraOffset.targetX = newMouseX * 0.5
      cameraOffset.targetY = newMouseY * 0.3
      return
    }

    // Rack mode: perform raycasting for unit hover
    const mouseDelta = Math.abs(newMouseX - lastMousePos.x) + Math.abs(newMouseY - lastMousePos.y)
    if (mouseDelta < MOUSE_MOVE_THRESHOLD) return

    lastMousePos.x = newMouseX
    lastMousePos.y = newMouseY
    mouse.x = newMouseX
    mouse.y = newMouseY

    if (rafId === null) {
      rafId = requestAnimationFrame(performRaycast)
    }
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })

  return {
    hoveredUnitId,
    serverUnitMeshes
  }
}
