import { useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useTranslation } from 'react-i18next'
import type { ServerUnit } from '@domain/types/makerRack'

interface Props {
  visible: boolean
  rackUnits: ServerUnit[]
  camera?: any
  renderer?: any
}

const getTranslationKey = (unitId: string): string => {
  const keyMap: Record<string, string> = {
    'udm-pro': 'udmPro',
    'silver-1u': 'silver1u',
    'patch-panel': 'patchPanel',
    'electric-switches': 'electricSwitches',
    'gaming-computer': 'gamingComputer'
  }
  return keyMap[unitId] || unitId
}

// Rack group world position (matches ServerRackComponent :position)
const RACK_POS = { x: 1.372, y: -1.7735, z: 0.5 }
const UNIT_Z_OFFSET = 0.4
// Right edge of rack frame (half width = 0.543)
const RACK_RIGHT_EDGE_X = RACK_POS.x + 0.6

interface UnitPosition {
  unit: ServerUnit
  top: number
  rackEdgeX: number
}

export default function RackLegend({ visible, rackUnits, camera, renderer }: Props) {
  const { t } = useTranslation()

  const [unitPositions, setUnitPositions] = useState<UnitPosition[]>([])

  // Recompute when legend becomes visible (camera is static in rack mode)
  useEffect(() => {
    if (!visible) return

    // Project 3D unit positions to screen coordinates using the camera
    const computePositions = () => {
      // Tolerate a Vue-style ref being passed through during migration
      const cam = (camera as any)?.value || camera
      const ren = (renderer as any)?.value || renderer
      if (!cam || !ren) return

      const sorted = [...rackUnits].sort((a, b) => b.y - a.y)

      setUnitPositions(sorted.map(unit => {
        // Project unit visual center to screen (y is base, add half height for center)
        const unitCenterY = RACK_POS.y + unit.y + unit.height / 2
        const worldPos = new Vector3(
          RACK_POS.x,
          unitCenterY,
          RACK_POS.z + UNIT_Z_OFFSET
        )
        worldPos.project(cam)
        const top = (-worldPos.y + 1) / 2 * 100

        // Project rack right edge at the same Y to get the line start X
        const edgePos = new Vector3(
          RACK_RIGHT_EDGE_X,
          unitCenterY,
          RACK_POS.z + UNIT_Z_OFFSET
        )
        edgePos.project(cam)
        const rackEdgeX = (edgePos.x + 1) / 2 * 100

        return { unit, top, rackEdgeX }
      }))
    }

    // Wait a frame for camera matrices to be updated
    const rafId = requestAnimationFrame(() => {
      computePositions()
    })

    return () => cancelAnimationFrame(rafId)
    // Matches the Vue watcher: recompute only when `visible` flips true
    // (camera is static in rack mode).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  if (!visible || unitPositions.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {unitPositions.map(({ unit, top, rackEdgeX }) => (
        <div
          key={unit.id}
          className="absolute flex items-center gap-0 opacity-90 pointer-events-auto"
          style={{
            top: `${top}%`,
            left: `${rackEdgeX}%`,
            transform: 'translateY(-50%)'
          }}
        >
          {/* Dashed line from rack edge to label */}
          <div className="w-6 sm:w-10 md:w-14 border-t border-dashed border-white/60 shrink-0"></div>
          {/* Label */}
          <div className="pl-1">
            <div className="label-hand text-white text-[10px] sm:text-xs whitespace-nowrap">
              {t(`maker.rackUnits.${getTranslationKey(unit.id)}.name`)}
            </div>
            {unit.id === 'nas' && (
              <div className="label-hand text-white/50 text-[8px] sm:text-[10px] whitespace-nowrap">
                Proxmox avec Unraid et Docker
              </div>
            )}
            {unit.id === 'gaming-computer' && (
              <div className="label-hand text-white/50 text-[8px] sm:text-[10px] whitespace-nowrap">
                32 Go RAM, i7 3.4 GHz, RTX 4070 Ti SUPER, 1 To NVMe
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
