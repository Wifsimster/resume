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

  const dustParticlesRef = useRef(dustParticles)
  dustParticlesRef.current = dustParticles
  const getDustPosRef = useRef(getDustPos)
  getDustPosRef.current = getDustPos

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

  const createInstancedMesh = useCallback(() => {
    const particles = dustParticlesRef.current
    if (particles.length === 0) {
      disposeInstancedMesh()
      return
    }

    const group = groupRef.current
    if (!group) return

    if (instancedMeshRef.current && instancedMeshRef.current.count !== particles.length) {
      disposeInstancedMesh()
    }

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

  useImperativeHandle(ref, () => ({ updateInstances }), [updateInstances])

  useEffect(() => {
    createInstancedMesh()
  }, [dustParticles.length, createInstancedMesh])

  useEffect(() => {
    return () => {
      disposeInstancedMesh()
    }
  }, [disposeInstancedMesh])

  if (dustParticles.length === 0) return null
  return <group ref={groupRef} />
}
