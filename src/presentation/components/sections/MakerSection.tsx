import { Suspense, lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MakerSceneHandle } from '@presentation/components/three/scenes/MakerScene'
import { useAchievements } from '@application/hooks/useAchievements'
import type { CameraMode } from '@application/hooks/useMakerCamera'
import RackLegend from '@presentation/components/ui/RackLegend'
import { rackUnits } from '@domain/data/makerRack'
import './MakerSection.css'

// Code-split + visibility-gated: the heaviest scene of the site only loads
// once the visitor scrolls within reach of the maker section.
const MakerCanvas = lazy(() => import('@presentation/components/three/MakerCanvas'))

// Real DIY projects from brag documents
const projects = [
  { icon: '🏠', label: 'Cabane sur pilotis', year: '2023' },
  { icon: '🔥', label: 'Poêle à bois & conduit', year: '2023' },
  { icon: '🤖', label: 'Domotique Home Assistant', year: '2023' },
  { icon: '🚿', label: 'Salle d\'eau & douche italienne', year: '2024' },
  { icon: '🛠️', label: 'Rénovation cellier & bureau', year: '2025' }
]

// Tech stack used
const techStack = [
  { icon: '🍓', label: 'Raspberry Pi' },
  { icon: '🏠', label: 'Home Assistant' },
  { icon: '🔌', label: 'ESP8266 / Arduino' },
  { icon: '📡', label: 'Ubiquiti Network' },
  { icon: '💾', label: 'Unraid NAS' },
  { icon: '🖥️', label: 'Self-Hosting' }
]

// Convert unit ID (with dashes) to translation key (camelCase)
const getTranslationKey = (unitId: string | null): string | null => {
  if (!unitId) return null
  // Convert dash-separated IDs to camelCase for translation keys
  const keyMap: Record<string, string> = {
    'udm-pro': 'udmPro',
    'silver-1u': 'silver1u'
  }
  return keyMap[unitId] || unitId
}

export default function MakerSection() {
  const { t } = useTranslation()
  const { unlock } = useAchievements()

  // One-way latch: flips true when the section gets close to the viewport
  const [canvasWanted, setCanvasWanted] = useState(false)

  // Tooltip state
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // MakerScene handle (camera/renderer used by RackLegend) — stored in state
  // via a callback ref so RackLegend re-renders once the scene is ready
  const [makerSceneHandle, setMakerSceneHandle] = useState<MakerSceneHandle | null>(null)

  // Camera mode state - managed here, passed as prop to MakerScene
  const [cameraMode, setCameraMode] = useState<CameraMode>('desk')

  // Toggle camera mode
  const handleToggleCamera = () => {
    setCameraMode(mode => (mode === 'desk' ? 'rack' : 'desk'))
  }

  // Check if desk mode is active
  const isDeskMode = cameraMode === 'desk'

  // Handle hover events from MakerScene
  const handleHoverUnit = (unitId: string | null) => {
    setHoveredUnitId(unitId)
  }

  // Touch devices get a fixed bottom-sheet tooltip instead of cursor-anchored
  // (there is no persistent cursor to anchor to).
  const [isCoarsePointer] = useState(() => window.matchMedia('(pointer: coarse)').matches)

  // Load the 3D canvas as soon as the section approaches the viewport
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

  // Unlock maker fan achievement when section becomes visible
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

    // Track mouse position for tooltip positioning
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      observer.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [unlock])

  const hoveredTranslationKey = getTranslationKey(hoveredUnitId)

  return (
    <section id="maker" className="maker-section section bg-transparent relative section-padding" data-section="maker">
      {/* Camera View Toggle Switch */}
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

      {/* 3D Canvas - Full background */}
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

      {/* Tooltip for server rack units */}
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

      {/* Rack Legend - Hand-drawn annotations (PERFORMANCE FIXED) */}
      <RackLegend
        visible={!isDeskMode && !!makerSceneHandle}
        rackUnits={rackUnits}
        camera={makerSceneHandle?.camera}
        renderer={makerSceneHandle?.renderer}
      />
    </section>
  )
}
