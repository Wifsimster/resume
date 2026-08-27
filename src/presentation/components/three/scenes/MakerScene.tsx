import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import type { Camera, Group, Object3D, PerspectiveCamera as ThreePerspectiveCamera, WebGLRenderer } from 'three'
import type { CameraMode } from '@application/hooks/useMakerCamera'
import type { QualityLevel } from '@application/hooks/useQuality'
import { useAnimationController } from '@application/hooks/useAnimationController'
import { useScreenTexture } from '@application/hooks/useScreenTexture'
import { useMakerCamera } from '@application/hooks/useMakerCamera'
import { useMakerAnimations } from '@application/hooks/useMakerAnimations'
import { useMakerInteraction } from '@application/hooks/useMakerInteraction'
import { useQuality } from '@application/hooks/useQuality'
import { rackUnits, makerColors } from '@domain/data/makerRack'
import DeskComponent from './maker/DeskComponent'
import MonitorComponent from './maker/MonitorComponent'
import KeyboardComponent from './maker/KeyboardComponent'
import MouseComponent from './maker/MouseComponent'
import ServerRackComponent from './maker/ServerRackComponent'
import DustParticlesComponent, { type DustParticle, type DustParticlesHandle } from './maker/DustParticlesComponent'

// Context exposed to the parent component (RackLegend) — the Vue version used
// defineExpose({ camera, renderer })
export interface MakerSceneHandle {
  camera: Camera
  renderer: WebGLRenderer
}

interface Props {
  quality: QualityLevel
  cameraMode: CameraMode
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
  title?: string
  subtitle?: string
  onHoverUnit: (unitId: string | null) => void
  ref?: Ref<MakerSceneHandle>
}

export default function MakerScene({ quality, cameraMode, projects, techStack, title, subtitle, onHoverUnit, ref }: Props) {
  // Screen texture
  const { screenTexture } = useScreenTexture({
    title,
    subtitle,
    projects,
    techStack
  })

  // Get section element for visibility detection. Resolved lazily during the
  // first render (the parent section DOM is already mounted by then) so the
  // animation controller's IntersectionObserver effect sees it.
  const sectionElementRef = useRef<HTMLElement | null>(null)
  if (sectionElementRef.current === null) {
    sectionElementRef.current = document.querySelector('[data-section="maker"]') as HTMLElement | null
  }

  // Animation controller
  const animationController = useAnimationController(sectionElementRef)

  // Freeze this canvas's WebGL render loop while the maker section is
  // off-screen — R3F otherwise keeps rendering every canvas at full frame
  // rate during scrolling. Also silences the useFrame-driven rack LED/fan
  // animations, which run on the same loop.
  const set = useThree(state => state.set)
  useEffect(() => {
    if (animationController.isVisible && !animationController.isPaused) {
      set({ frameloop: 'always' })
    } else {
      set({ frameloop: 'never' })
    }
  }, [animationController.isVisible, animationController.isPaused, set])

  const sceneRef = useRef<Group>(null)
  const serverUnitMeshes = useRef<Map<string, Object3D>>(new Map()).current
  const dustParticlesRef = useRef<DustParticlesHandle | null>(null)

  // Camera control state
  const cameraOffset = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  }).current

  // Camera setup - mode is driven by parent via prop
  const { cameraPosition, cameraLookAt, updateCamera } = useMakerCamera(cameraOffset, cameraMode)

  // Get R3F context (camera and renderer) - this works because we're inside Canvas
  const { camera, gl } = useThree()

  // Quality settings for performance optimization
  const { renderSettings } = useQuality()

  // Expose context for parent component (RackLegend)
  useImperativeHandle(ref, () => ({
    camera,
    renderer: gl
  }), [camera, gl])

  // The rendered camera object, mutated directly every animation frame
  const cameraRef = useRef<ThreePerspectiveCamera>(null)

  // Server rack configuration - adjust based on quality
  const visibleRackUnits = useMemo(() => {
    if (quality === 'minimal') {
      return rackUnits.slice(0, 3)
    } else if (quality === 'low') {
      return rackUnits.slice(0, 5)
    }
    return rackUnits
  }, [quality])

  // Animation setup
  const { anim, updateAnimations } = useMakerAnimations(
    sceneRef,
    cameraOffset,
    updateCamera
  )

  // Interaction setup
  const { hoveredUnitId } = useMakerInteraction(
    sceneRef,
    cameraOffset,
    cameraMode,
    serverUnitMeshes,
    onHoverUnit
  )

  // Clear stale mesh references when mode changes (prevents raycasting against
  // disposed objects). Done during render — like Vue's pre-flush watch — so the
  // clear happens BEFORE the new mode's units register their refs at commit.
  const prevCameraModeRef = useRef(cameraMode)
  if (prevCameraModeRef.current !== cameraMode) {
    prevCameraModeRef.current = cameraMode
    serverUnitMeshes.clear()
  }

  // Dust particles - plain data, only regenerated when quality changes
  const dustParticles = useMemo<DustParticle[]>(() => {
    if (quality === 'minimal') {
      return []
    }
    const baseParticleCount = 30
    const particleCount = Math.floor(baseParticleCount * renderSettings.particleMultiplier)
    if (particleCount <= 0) {
      return []
    }

    return Array.from({ length: particleCount }, () => ({
      x: -4 + Math.random() * 10,
      y: -0.5 + Math.random() * 4,
      z: -2 + Math.random() * 4,
      speed: 0.1 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2
    }))
  }, [quality, renderSettings.particleMultiplier])

  // Dust particle animation.
  // Reuses a single scratch object: the consumer reads x/y/z synchronously before
  // the next call, so we avoid allocating a fresh object per particle per frame.
  const dustScratch = useRef({ x: 0, y: 0, z: 0 }).current
  const getDustPos = useCallback((particle: DustParticle) => {
    dustScratch.x = particle.x + Math.sin(anim.time * particle.speed + particle.phase) * 0.4
    dustScratch.y = particle.y + Math.sin(anim.time * particle.speed * 0.7 + particle.phase) * 0.25
    dustScratch.z = particle.z
    return dustScratch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle server rack unit refs
  const handleUnitRef = useCallback((unitId: string, unitRef: Object3D | null) => {
    if (unitRef) {
      serverUnitMeshes.set(unitId, unitRef)
    } else {
      serverUnitMeshes.delete(unitId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Apply the initial camera transform immediately
    const cam = cameraRef.current
    if (cam) {
      cam.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
      cam.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z)
    }

    // Full animation with plain (non-reactive) anim object
    animationController.start((elapsed, delta) => {
      updateAnimations(elapsed, delta)
      dustParticlesRef.current?.updateInstances()

      // Apply camera position and look-at (the Vue version bound these
      // reactively on <TresPerspectiveCamera>)
      const currentCam = cameraRef.current
      if (currentCam) {
        currentCam.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
        currentCam.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z)
      }
    })

    return () => {
      animationController.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef}
        position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]} />

      {/* Desk Lighting */}
      {cameraMode === 'desk' && <ambientLight intensity={3.0} />}
      {cameraMode === 'desk' && <directionalLight position={[2, 10, 5]} intensity={6} color="#FFFFFF" />}
      {cameraMode === 'desk' && <pointLight position={[-2, 4, 4]} intensity={12} color="#FFFFFF" />}
      {cameraMode === 'desk' && renderSettings.lightCount >= 3 && <pointLight position={[-2, 2.5, 0]} intensity={8} color={makerColors.screenGlow} />}
      {cameraMode === 'desk' && renderSettings.lightCount >= 4 && <pointLight position={[0, 3, 2]} intensity={5} color={makerColors.wifi} />}
      {cameraMode === 'desk' && renderSettings.lightCount >= 5 && <pointLight position={[-3, 1, 3]} intensity={4} color="#FFFFFF" />}

      {/* Rack Lighting (centered on rack at x=1.372) - boosted for dark metal materials */}
      {cameraMode === 'rack' && <ambientLight intensity={5.0} />}
      {cameraMode === 'rack' && <directionalLight position={[1.372, 8, 6]} intensity={10} color="#FFFFFF" />}
      {/* Strong frontal key light */}
      {cameraMode === 'rack' && <pointLight position={[1.372, 1, 3.5]} intensity={20} color="#FFFFFF" />}
      {/* Overhead light */}
      {cameraMode === 'rack' && <pointLight position={[1.372, 4, 1]} intensity={15} color="#FFFFFF" />}
      {/* Blue accent from behind */}
      {cameraMode === 'rack' && renderSettings.lightCount >= 3 && <pointLight position={[1.372, 1.5, -1]} intensity={12} color={makerColors.serverBlue} />}
      {/* Right side fill */}
      {cameraMode === 'rack' && renderSettings.lightCount >= 4 && <pointLight position={[3, 0.5, 2]} intensity={8} color="#FFFFFF" />}
      {/* Left side fill */}
      {cameraMode === 'rack' && renderSettings.lightCount >= 5 && <pointLight position={[-0.3, 0.5, 2]} intensity={8} color="#FFFFFF" />}

      <group ref={sceneRef}>
        {/* Desk Animation */}
        {cameraMode === 'desk' && (
          <group>
            <DeskComponent colors={makerColors} />
            <MonitorComponent screenTexture={screenTexture} colors={makerColors} />
            <KeyboardComponent colors={makerColors} />
            <MouseComponent />
          </group>
        )}

        {/* Rack Animation */}
        {cameraMode === 'rack' && (
          <group>
            <ServerRackComponent visibleRackUnits={visibleRackUnits} hoveredUnitId={hoveredUnitId} anim={anim}
              colors={makerColors} onUnitRef={handleUnitRef} />
          </group>
        )}

        {/* Shared: Dust Particles & Backdrop */}
        {dustParticles.length > 0 && (
          <DustParticlesComponent ref={dustParticlesRef}
            dustParticles={dustParticles} getDustPos={getDustPos} />
        )}

        <mesh position={[1, 2, -2.5]}>
          <planeGeometry args={[16, 7]} />
          <meshBasicMaterial color="#0A0A0A" />
        </mesh>
      </group>

      {/* Floor */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshBasicMaterial color="#080808" />
      </mesh>
    </>
  )
}
