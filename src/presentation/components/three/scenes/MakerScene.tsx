import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import { useThree } from '@react-three/fiber'
import SceneCamera from '../SceneCamera'
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
import DeskPropsComponent from './maker/DeskPropsComponent'
import { createContactShadowTexture, createFloorTexture, createWallGradientTexture } from '../utils/proceduralTextures'

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
  const { screenTexture } = useScreenTexture({
    title,
    subtitle,
    projects,
    techStack
  })

  const sectionElementRef = useRef<HTMLElement | null>(null)
  if (sectionElementRef.current === null) {
    sectionElementRef.current = document.querySelector('[data-section="maker"]') as HTMLElement | null
  }

  const animationController = useAnimationController(sectionElementRef)

  const set = useThree(state => state.set)
  useEffect(() => {
    if (animationController.isVisible && !animationController.isPaused) {
      set({ frameloop: 'always' })
    } else {
      set({ frameloop: 'never' })
    }
  }, [animationController.isVisible, animationController.isPaused, set])

  const contactShadowTexture = useMemo(() => createContactShadowTexture(), [])
  const wallTexture = useMemo(() => createWallGradientTexture(), [])
  const floorTexture = useMemo(() => createFloorTexture(), [])
  useEffect(() => () => {
    contactShadowTexture.dispose()
    wallTexture.dispose()
    floorTexture.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sceneRef = useRef<Group>(null)
  const serverUnitMeshes = useRef<Map<string, Object3D>>(new Map()).current
  const dustParticlesRef = useRef<DustParticlesHandle | null>(null)

  const cameraOffset = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  }).current

  const { cameraPosition, cameraLookAt, updateCamera } = useMakerCamera(cameraOffset, cameraMode)

  const { camera, gl } = useThree()

  const { renderSettings } = useQuality()

  useImperativeHandle(ref, () => ({
    camera,
    renderer: gl
  }), [camera, gl])

  const cameraRef = useRef<ThreePerspectiveCamera>(null)

  const visibleRackUnits = useMemo(() => {
    if (quality === 'minimal') {
      return rackUnits.slice(0, 3)
    } else if (quality === 'low') {
      return rackUnits.slice(0, 5)
    }
    return rackUnits
  }, [quality])

  const { anim, updateAnimations } = useMakerAnimations(
    sceneRef,
    cameraOffset,
    updateCamera
  )

  const { hoveredUnitId } = useMakerInteraction(
    sceneRef,
    cameraOffset,
    cameraMode,
    serverUnitMeshes,
    onHoverUnit
  )

  const prevCameraModeRef = useRef(cameraMode)
  if (prevCameraModeRef.current !== cameraMode) {
    prevCameraModeRef.current = cameraMode
    serverUnitMeshes.clear()
  }

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

  const dustScratch = useRef({ x: 0, y: 0, z: 0 }).current
  const getDustPos = useCallback((particle: DustParticle) => {
    dustScratch.x = particle.x + Math.sin(anim.time * particle.speed + particle.phase) * 0.4
    dustScratch.y = particle.y + Math.sin(anim.time * particle.speed * 0.7 + particle.phase) * 0.25
    dustScratch.z = particle.z
    return dustScratch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUnitRef = useCallback((unitId: string, unitRef: Object3D | null) => {
    if (unitRef) {
      serverUnitMeshes.set(unitId, unitRef)
    } else {
      serverUnitMeshes.delete(unitId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const cam = cameraRef.current
    if (cam) {
      cam.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
      cam.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z)
    }

    animationController.start((elapsed, delta) => {
      updateAnimations(elapsed, delta)
      dustParticlesRef.current?.updateInstances()

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
      <SceneCamera ref={cameraRef}
        position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]} />

      <hemisphereLight args={['#8A9BC0', '#3A2818']} intensity={2.8} />

      {cameraMode === 'desk' && (
        <>
          <directionalLight position={[2.5, 8, 5]} intensity={4.5} color="#FFF2DE" />
          <pointLight position={[-2, 2.5, 3.5]} intensity={8} color="#FFFFFF" distance={7} decay={2} />
          {renderSettings.lightCount >= 3 && (
            <pointLight position={[-2, 1.3, 1.2]} intensity={5} color={makerColors.screenGlow} distance={4.5} decay={2} />
          )}
          {renderSettings.lightCount >= 4 && (
            <pointLight position={[0.6, 1.6, 1.4]} intensity={6} color="#FFB870" distance={5} decay={2} />
          )}
        </>
      )}

      {cameraMode === 'rack' && (
        <>
          <ambientLight intensity={1.8} />
          <directionalLight position={[2.5, 8, 6]} intensity={4} color="#FFF2DE" />
          <pointLight position={[1.372, 0.5, 3]} intensity={24} color="#FFFFFF" distance={8} decay={2} />
          <pointLight position={[1.372, -1.1, 2.4]} intensity={10} color="#EAF2FF" distance={6} decay={2} />
          {renderSettings.lightCount >= 3 && (
            <pointLight position={[1.372, 1.5, -1]} intensity={10} color={makerColors.serverBlue} distance={5} decay={2} />
          )}
          {renderSettings.lightCount >= 4 && (
            <pointLight position={[1.372, -1.4, 1.8]} intensity={6} color="#FFB870" distance={4} decay={2} />
          )}
        </>
      )}

      <group ref={sceneRef}>
        {cameraMode === 'desk' && (
          <group>
            <DeskComponent colors={makerColors} />
            <MonitorComponent screenTexture={screenTexture} colors={makerColors} />
            <KeyboardComponent colors={makerColors} />
            <MouseComponent />
            {quality !== 'minimal' && <DeskPropsComponent />}
          </group>
        )}

        {cameraMode === 'rack' && (
          <group>
            <ServerRackComponent visibleRackUnits={visibleRackUnits} hoveredUnitId={hoveredUnitId} anim={anim}
              colors={makerColors} onUnitRef={handleUnitRef} />
          </group>
        )}

        {dustParticles.length > 0 && (
          <DustParticlesComponent ref={dustParticlesRef}
            dustParticles={dustParticles} getDustPos={getDustPos} />
        )}

        <mesh position={[1, 1.7, -2.5]}>
          <planeGeometry args={[26, 9]} />
          <meshBasicMaterial map={wallTexture} />
        </mesh>
      </group>

      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshBasicMaterial map={floorTexture} />
      </mesh>

      {cameraMode === 'desk' && (
        <>
          <mesh position={[-2, -1.79, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.4, 3.4]} />
            <meshBasicMaterial map={contactShadowTexture} transparent depthWrite={false} />
          </mesh>
          <mesh position={[-2, 0.032, 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 0.9]} />
            <meshBasicMaterial map={contactShadowTexture} transparent depthWrite={false} opacity={0.7} />
          </mesh>
          <mesh position={[-2, 0.032, 0.82]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.5, 0.7]} />
            <meshBasicMaterial map={contactShadowTexture} transparent depthWrite={false} opacity={0.55} />
          </mesh>
        </>
      )}
      {cameraMode === 'rack' && (
        <mesh position={[1.372, -1.79, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 2.6]} />
          <meshBasicMaterial map={contactShadowTexture} transparent depthWrite={false} />
        </mesh>
      )}
    </>
  )
}
