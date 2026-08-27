import { useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import { Matrix4, InstancedMesh, SphereGeometry, MeshBasicMaterial } from 'three'
import type { Group } from 'three'

export interface DustParticle {
  x: number
  y: number
  z: number
  speed: number
  phase: number
}

export interface DustParticlesHandle {
  updateInstances: () => void
}

interface Props {
  dustParticles: DustParticle[]
  getDustPos: (particle: DustParticle) => { x: number, y: number, z: number }
  ref?: Ref<DustParticlesHandle>
}

export default function DustParticlesComponent({ dustParticles, getDustPos, ref }: Props) {
  const groupRef = useRef<Group>(null)
  const instancedMeshRef = useRef<InstancedMesh | null>(null)
  const matrixRef = useRef<Matrix4 | null>(null)
  if (matrixRef.current === null) matrixRef.current = new Matrix4()

  // Latest props in refs so updateInstances (called from the parent's
  // animation loop) never reads stale values
  const dustParticlesRef = useRef(dustParticles)
  dustParticlesRef.current = dustParticles
  const getDustPosRef = useRef(getDustPos)
  getDustPosRef.current = getDustPos

  // Dispose of existing instanced mesh
  const disposeInstancedMesh = useCallback(() => {
    if (instancedMeshRef.current) {
      const group = groupRef.current
      if (group && instancedMeshRef.current.parent === group) {
        group.remove(instancedMeshRef.current)
      }
      instancedMeshRef.current.geometry.dispose()
      if (Array.isArray(instancedMeshRef.current.material)) {
        instancedMeshRef.current.material.forEach(mat => mat.dispose())
      } else {
        instancedMeshRef.current.material.dispose()
      }
      instancedMeshRef.current = null
    }
  }, [])

  // Update instance positions
  const updateInstances = useCallback(() => {
    const instancedMesh = instancedMeshRef.current
    const particles = dustParticlesRef.current
    if (!instancedMesh || particles.length === 0) return

    const matrix = matrixRef.current!
    particles.forEach((particle, i) => {
      if (i >= instancedMesh.count) return
      const pos = getDustPosRef.current(particle)
      matrix.setPosition(pos.x, pos.y, pos.z)
      instancedMesh.setMatrixAt(i, matrix)
    })

    instancedMesh.instanceMatrix.needsUpdate = true
  }, [])

  // Create or update instanced mesh
  const createInstancedMesh = useCallback(() => {
    const particles = dustParticlesRef.current
    if (particles.length === 0) {
      disposeInstancedMesh()
      return
    }

    // Effects run after commit, so the group (rendered in the same pass) is
    // already mounted — the Vue version needed nextTick for the same reason.
    const group = groupRef.current
    if (!group) return

    // Dispose old mesh if particle count changed
    if (instancedMeshRef.current && instancedMeshRef.current.count !== particles.length) {
      disposeInstancedMesh()
    }

    // Create new instanced mesh if needed
    if (!instancedMeshRef.current) {
      const geometry = new SphereGeometry(0.01, 4, 4)
      const material = new MeshBasicMaterial({
        color: '#FFFFFF',
        opacity: 0.1,
        transparent: true
      })

      const instancedMesh = new InstancedMesh(geometry, material, particles.length)
      instancedMeshRef.current = instancedMesh
      group.add(instancedMesh)
    }

    updateInstances()
  }, [disposeInstancedMesh, updateInstances])

  // Expose updateInstances for parent to call directly in animation loop
  // This avoids expensive per-frame prop churn
  useImperativeHandle(ref, () => ({ updateInstances }), [updateInstances])

  // Create on mount and when the particle count changes
  useEffect(() => {
    createInstancedMesh()
  }, [dustParticles.length, createInstancedMesh])

  // Dispose on unmount
  useEffect(() => {
    return () => {
      disposeInstancedMesh()
    }
  }, [disposeInstancedMesh])

  if (dustParticles.length === 0) return null
  return <group ref={groupRef} />
}
