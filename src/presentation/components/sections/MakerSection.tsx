import { Suspense, lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MakerSceneHandle } from '@presentation/components/three/scenes/MakerScene'
import { useAchievements } from '@application/hooks/useAchievements'
import type { CameraMode } from '@application/hooks/useMakerCamera'
import RackLegend from '@presentation/components/ui/RackLegend'
import { rackUnits } from '@domain/data/makerRack'
import './MakerSection.css'

const MakerCanvas = lazy(() => import('@presentation/components/three/MakerCanvas'))

const projects = [
  { icon: '🏠', label: 'Cabane sur pilotis', year: '2023' },
  { icon: '🔥', label: 'Poêle à bois & conduit', year: '2023' },
  { icon: '🤖', label: 'Domotique Home Assistant', year: '2023' },
  { icon: '🚿', label: 'Salle d\'eau & douche italienne', year: '2024' },
  { icon: '🛠️', label: 'Rénovation cellier & bureau', year: '2025' }
]

const techStack = [
  { icon: '🍓', label: 'Raspberry Pi' },
  { icon: '🏠', label: 'Home Assistant' },
  { icon: '🔌', label: 'ESP8266 / Arduino' },
  { icon: '📡', label: 'Ubiquiti Network' },
  { icon: '💾', label: 'Unraid NAS' },
  { icon: '🖥️', label: 'Self-Hosting' }
]

const getTranslationKey = (unitId: string | null): string | null => {
  if (!unitId) return null
  const keyMap: Record<string, string> = {
    'udm-pro': 'udmPro',
    'silver-1u': 'silver1u'
  }
  return keyMap[unitId] || unitId
}

export default function MakerSection() {
  const { t } = useTranslation()
  const { unlock } = useAchievements()

  const [canvasWanted, setCanvasWanted] = useState(false)

  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const [makerSceneHandle, setMakerSceneHandle] = useState<MakerSceneHandle | null>(null)

  const [cameraMode, setCameraMode] = useState<CameraMode>('desk')

  const handleToggleCamera = () => {
    setCameraMode(mode => (mode === 'desk' ? 'rack' : 'desk'))
  }

  const isDeskMode = cameraMode === 'desk'

  const handleHoverUnit = (unitId: string | null) => {
    setHoveredUnitId(unitId)
  }

  const [isCoarsePointer] = useState(() => window.matchMedia('(pointer: coarse)').matches)

  useEffect(() => {
    const section = document.querySelector('[data-section="maker"]')
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setCanvasWanted(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px' }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            unlock('makerFan')
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    const section = document.querySelector('[data-section="maker"]')
    if (section) {
      observer.observe(section)
    }

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      observer.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [unlock])

  const hoveredTranslationKey = getTranslationKey(hoveredUnitId)

  return (
    <section id="maker" className="maker-section section bg-transparent relative section-padding" data-section="maker">
      <div className="absolute top-0 left-0 right-0 z-50 section-padding">
        <div className="sticky top-0 flex justify-center">
          <button
            className="flex items-center justify-between w-[90px] h-9 p-0.5 bg-[#1E1E1E]/80 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-200 hover:border-white/20 sm:w-20 sm:h-10"
            onClick={handleToggleCamera}
            aria-label={isDeskMode ? t('maker.cameraViewRack') : t('maker.cameraViewDesk')}
          >
            <span
              className={`flex items-center justify-center w-8 h-8 text-lg rounded-full transition-all duration-200 select-none sm:w-9 sm:h-9 sm:text-xl ${isDeskMode ? 'opacity-100 bg-white/10' : 'opacity-50'}`}
              title={t('maker.cameraViewDesk')}
            >🖥️</span>
            <span
              className={`flex items-center justify-center w-8 h-8 text-lg rounded-full transition-all duration-200 select-none sm:w-9 sm:h-9 sm:text-xl ${!isDeskMode ? 'opacity-100 bg-white/10' : 'opacity-50'}`}
              title={t('maker.cameraViewRack')}
            >🗄️</span>
          </button>
        </div>
      </div>

      <div className="section-canvas">
        {canvasWanted && (
          <Suspense fallback={null}>
            <MakerCanvas
              cameraMode={cameraMode}
              projects={projects}
              techStack={techStack}
              title={t('maker.title')}
              subtitle={t('maker.subtitle')}
              onHoverUnit={handleHoverUnit}
              onHandle={setMakerSceneHandle}
            />
          </Suspense>
        )}
      </div>

      {hoveredUnitId && hoveredTranslationKey && (
        <div
          className={`fixed z-50 pointer-events-none transition-opacity duration-200 ${isCoarsePointer ? 'bottom-4 left-4 right-4 flex justify-center' : ''}`}
          style={isCoarsePointer ? undefined : {
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 10}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-[color-mix(in_srgb,var(--color-copper)_50%,transparent)] rounded-lg px-4 py-3 shadow-xl max-w-xs">
            <h3 className="text-[var(--color-copper)] font-semibold mb-1 text-sm">
              {t(`maker.rackUnits.${hoveredTranslationKey}.name`)}
            </h3>
            <p className="text-white/70 text-xs leading-relaxed">
              {t(`maker.rackUnits.${hoveredTranslationKey}.description`)}
            </p>
          </div>
        </div>
      )}

      <RackLegend
        visible={!isDeskMode && !!makerSceneHandle}
        rackUnits={rackUnits}
        camera={makerSceneHandle?.camera}
        renderer={makerSceneHandle?.renderer}
      />
    </section>
  )
}
