import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Raycaster, Vector2 } from 'three'
import type { Object3D } from 'three'
import { useThree } from '@react-three/fiber'
import type { CameraMode } from './useMakerCamera'

interface CameraOffset {
  x: number
  y: number
  targetX: number
  targetY: number
}

export function useMakerInteraction(
  sceneRef: RefObject<any>,
  cameraOffset: CameraOffset,
  cameraMode: CameraMode,
  serverUnitMeshes: Map<string, Object3D>,
  onHoverChange: (unitId: string | null) => void
) {
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null)
  const { camera, gl } = useThree()

  const hoveredUnitIdRef = useRef<string | null>(null)
  const cameraModeRef = useRef(cameraMode)
  cameraModeRef.current = cameraMode
  const onHoverChangeRef = useRef(onHoverChange)
  onHoverChangeRef.current = onHoverChange
  const cameraRef = useRef(camera)
  cameraRef.current = camera
  const glRef = useRef(gl)
  glRef.current = gl

  useEffect(() => {
    if (cameraMode !== 'rack' && hoveredUnitIdRef.current !== null) {
      hoveredUnitIdRef.current = null
      setHoveredUnitId(null)
      onHoverChangeRef.current(null)
    }
  }, [cameraMode])

  useEffect(() => {
    const mouse = new Vector2()
    const raycasterInstance = new Raycaster()

    let rafId: number | null = null
    const lastMousePos = { x: 0, y: 0 }
    const MOUSE_MOVE_THRESHOLD = 0.01

    const setHover = (unitId: string | null) => {
      hoveredUnitIdRef.current = unitId
      setHoveredUnitId(unitId)
      onHoverChangeRef.current(unitId)
    }

    const performRaycast = () => {
      const rendererInstance = glRef.current
      if (!cameraRef.current || !rendererInstance || !sceneRef.current) {
        rafId = null
        return
      }

      raycasterInstance.setFromCamera(mouse, cameraRef.current)

      const meshes = Array.from(serverUnitMeshes.values()).filter(Boolean)

      if (meshes.length === 0) {
        rafId = null
        return
      }

      const intersects = raycasterInstance.intersectObjects(meshes, true)

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object
        let current: Object3D | null = intersectedObject
        let unitId: string | null = null

        while (current && !unitId) {
          const currentObj = current
          unitId = Array.from(serverUnitMeshes.entries())
            .find(([_, meshObj]) => {
              return meshObj === currentObj || (meshObj && meshObj.children && meshObj.children.includes(currentObj))
            })?.[0] || null
          current = current.parent
        }

        if (unitId && unitId !== hoveredUnitIdRef.current) {
          setHover(unitId)
        }
      } else {
        if (hoveredUnitIdRef.current !== null) {
          setHover(null)
        }
      }

      rafId = null
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rendererInstance = glRef.current
      if (!cameraRef.current || !rendererInstance || !sceneRef.current) return

      const canvas = rendererInstance.domElement
      const rect = canvas.getBoundingClientRect()

      const newMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const newMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (cameraModeRef.current === 'desk') {
        cameraOffset.targetX = newMouseX * 0.5
        cameraOffset.targetY = newMouseY * 0.3
        return
      }

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

    const handlePointerDown = (event: PointerEvent) => {
      if (cameraModeRef.current !== 'rack') return
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      lastMousePos.x = mouse.x
      lastMousePos.y = mouse.y
      if (rafId === null) {
        rafId = requestAnimationFrame(performRaycast)
      }
    }

    window.addEventListener('pointermove', handleMouseMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handleMouseMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    hoveredUnitId,
    serverUnitMeshes
  }
}
