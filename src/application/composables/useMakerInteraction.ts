import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { Raycaster, Vector2 } from 'three'
import { useTres } from '@tresjs/core'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerInteraction(
  sceneRef: Ref<any>,
  cameraOffset: CameraOffset,
  serverUnitMeshes: Ref<Map<string, any>>,
  onHoverChange: (unitId: string | null) => void
) {
  const hoveredUnitId = ref<string | null>(null)
  const { camera, renderer } = useTres()

  // Mouse position for raycasting
  const mouse = new Vector2()
  const raycasterInstance = new Raycaster()

  const handleMouseMove = (event: MouseEvent) => {
    const rendererInstance = (renderer as any).value
    if (!camera.value || !rendererInstance || !sceneRef.value) return

    // Access renderer's domElement (TresJS compatibility)
    const canvas = rendererInstance.domElement
    const rect = canvas.getBoundingClientRect()

    // Calculate normalized device coordinates
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Update camera offset based on mouse position (limited range)
    cameraOffset.targetX = mouse.x * 0.5 // Limit to ±0.5
    cameraOffset.targetY = mouse.y * 0.3 // Limit to ±0.3

    // Update raycaster
    raycasterInstance.setFromCamera(mouse, camera.value)

    // Find intersections with server unit meshes
    const meshes = Array.from(serverUnitMeshes.value.values())
      .map(mesh => {
        // Get the actual Three.js object from TresJS ref
        return mesh?.value || mesh
      })
      .filter(Boolean)

    if (meshes.length === 0) return

    const intersects = raycasterInstance.intersectObjects(meshes, true)

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      // Traverse up to find the parent group
      let current = intersectedObject
      let unitId: string | null = null

      // Check if this object or any parent is in our map
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
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return {
    hoveredUnitId,
    serverUnitMeshes
  }
}

