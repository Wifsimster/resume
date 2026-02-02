<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Matrix4, InstancedMesh, SphereGeometry, MeshBasicMaterial } from 'three'

export interface DustParticle {
  x: number
  y: number
  z: number
  speed: number
  phase: number
}

const props = defineProps<{
  dustParticles: DustParticle[]
  getDustPos: (particle: DustParticle) => { x: number, y: number, z: number }
}>()

const groupRef = ref()
const instancedMeshRef = ref<InstancedMesh | null>(null)
const matrix = new Matrix4()

// Dispose of existing instanced mesh
const disposeInstancedMesh = () => {
  if (instancedMeshRef.value) {
    if (groupRef.value) {
      const group = groupRef.value.value || groupRef.value
      if (group && instancedMeshRef.value.parent === group) {
        group.remove(instancedMeshRef.value)
      }
    }
    instancedMeshRef.value.geometry.dispose()
    if (Array.isArray(instancedMeshRef.value.material)) {
      instancedMeshRef.value.material.forEach(mat => mat.dispose())
    } else {
      instancedMeshRef.value.material.dispose()
    }
    instancedMeshRef.value = null
  }
}

// Create or update instanced mesh
const createInstancedMesh = async () => {
  if (props.dustParticles.length === 0) {
    disposeInstancedMesh()
    return
  }
  
  await nextTick()
  
  if (!groupRef.value) return
  
  const group = groupRef.value.value || groupRef.value
  if (!group) return
  
  // Dispose old mesh if particle count changed
  if (instancedMeshRef.value && instancedMeshRef.value.count !== props.dustParticles.length) {
    disposeInstancedMesh()
  }
  
  // Create new instanced mesh if needed
  if (!instancedMeshRef.value) {
    const geometry = new SphereGeometry(0.01, 4, 4)
    const material = new MeshBasicMaterial({ 
      color: '#FFFFFF', 
      opacity: 0.1, 
      transparent: true 
    })
    
    const instancedMesh = new InstancedMesh(geometry, material, props.dustParticles.length)
    instancedMeshRef.value = instancedMesh
    group.add(instancedMesh)
  }
  
  updateInstances()
}

// Update instance positions
const updateInstances = () => {
  if (!instancedMeshRef.value || props.dustParticles.length === 0) return
  
  props.dustParticles.forEach((particle, i) => {
    if (i >= instancedMeshRef.value!.count) return
    const pos = props.getDustPos(particle)
    matrix.setPosition(pos.x, pos.y, pos.z)
    instancedMeshRef.value!.setMatrixAt(i, matrix)
  })
  
  instancedMeshRef.value.instanceMatrix.needsUpdate = true
}

// Watch for particle count changes only
watch(() => props.dustParticles.length, () => {
  createInstancedMesh()
})

// Expose updateInstances for parent to call directly in animation loop
// This avoids expensive deep watch + array creation every frame
defineExpose({ updateInstances })

onMounted(() => {
  createInstancedMesh()
})

onUnmounted(() => {
  disposeInstancedMesh()
})
</script>

<template>
  <TresGroup v-if="dustParticles.length > 0" ref="groupRef" />
</template>

