import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useTranslation } from 'react-i18next'
import type { Camera } from 'three'
import type { ServerUnit } from '@domain/types/makerRack'

interface Props {
  visible: boolean
  rackUnits: ServerUnit[]
  camera?: Camera
  renderer?: unknown
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

const RACK_POS = { x: 1.372, y: -1.7735, z: 0.5 }
const UNIT_Z_OFFSET = 0.4
const RACK_RIGHT_EDGE_X = RACK_POS.x + 0.6
const LABEL_COLUMN_GAP = 56
const LABEL_MIN_GAP = 4

export default function RackLegend({ visible, rackUnits, camera }: Props) {
  const { t } = useTranslation()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const labelRefs = useRef(new Map<string, HTMLDivElement>())
  const lineRefs = useRef(new Map<string, SVGLineElement>())

  const sortedUnits = [...rackUnits].sort((a, b) => b.y - a.y)

  useEffect(() => {
    if (!visible || !camera) return

    const worldPos = new Vector3()
    let rafId: number

    const layout = () => {
      rafId = requestAnimationFrame(layout)
      const container = containerRef.current
      if (!container) return
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return

      const rows = sortedUnits.map(unit => {
        const unitCenterY = RACK_POS.y + unit.y + unit.height / 2
        worldPos.set(RACK_POS.x, unitCenterY, RACK_POS.z + UNIT_Z_OFFSET).project(camera)
        const unitY = ((-worldPos.y + 1) / 2) * height
        worldPos.set(RACK_RIGHT_EDGE_X, unitCenterY, RACK_POS.z + UNIT_Z_OFFSET).project(camera)
        const edgeX = ((worldPos.x + 1) / 2) * width
        const el = labelRefs.current.get(unit.id)
        const h = el?.offsetHeight ?? 16
        return { unit, unitY, edgeX, h, labelY: unitY }
      })

      const columnX = Math.max(...rows.map(r => r.edgeX)) + LABEL_COLUMN_GAP

      for (let i = 1; i < rows.length; i++) {
        const minY = rows[i - 1].labelY + rows[i - 1].h / 2 + rows[i].h / 2 + LABEL_MIN_GAP
        if (rows[i].labelY < minY) rows[i].labelY = minY
      }
      const maxY = height - 8
      for (let i = rows.length - 1; i >= 0; i--) {
        const limit = i === rows.length - 1
          ? maxY - rows[i].h / 2
          : rows[i + 1].labelY - rows[i + 1].h / 2 - rows[i].h / 2 - LABEL_MIN_GAP
        if (rows[i].labelY > limit) rows[i].labelY = limit
      }

      for (const row of rows) {
        const el = labelRefs.current.get(row.unit.id)
        if (el) {
          el.style.transform = `translate(${columnX}px, ${row.labelY - row.h / 2}px)`
          el.style.opacity = '0.9'
        }
        const line = lineRefs.current.get(row.unit.id)
        if (line) {
          line.setAttribute('x1', String(row.edgeX + 4))
          line.setAttribute('y1', String(row.unitY))
          line.setAttribute('x2', String(columnX - 6))
          line.setAttribute('y2', String(row.labelY))
        }
      }
    }

    rafId = requestAnimationFrame(layout)
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, camera, rackUnits])

  if (!visible) return null

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {sortedUnits.map(unit => (
          <line
            key={`line-${unit.id}`}
            ref={(el) => { if (el) lineRefs.current.set(unit.id, el); else lineRefs.current.delete(unit.id) }}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {sortedUnits.map(unit => (
        <div
          key={unit.id}
          ref={(el) => { if (el) labelRefs.current.set(unit.id, el); else labelRefs.current.delete(unit.id) }}
          className="absolute top-0 left-0 pointer-events-auto will-change-transform"
          style={{ opacity: 0 }}
        >
          <div className="label-hand text-white text-[10px] sm:text-xs whitespace-nowrap">
            {t(`maker.rackUnits.${getTranslationKey(unit.id)}.name`)}
          </div>
          {(unit.id === 'nas' || unit.id === 'gaming-computer') && (
            <div className="label-hand text-white/50 text-[8px] sm:text-[10px] whitespace-nowrap">
              {t(`maker.rackUnits.${getTranslationKey(unit.id)}.legend`)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
