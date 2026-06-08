<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue'
import { Points } from 'three'
import type { QualityLevel } from '@application/composables/useQuality'
import { useSceneAnimation } from '@application/composables/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'

const props = defineProps<{
  quality: QualityLevel
}>()

// "The Passion Gallery" — the seven things I love about the craft, arranged as
// an orderly carousel of three interconnected worlds (Share / Build / Play).
// Each symbol sits evenly around a single horizontal ring, gently facing the
// camera, the whole group slowly turning around the vertical axis while each
// piece bobs on its own sine phase and self-rotates. Calm and curated — the
// deliberate opposite of the Hero scene's busy constellation.
const themeColors = {
  core: '#A855F7',
  beacon: '#22D3EE',
  ring: '#8B5CF6'
}

// The seven symbolic passions, kept from the original scene. `world` groups
// them into the three interconnected themes; `color` keeps each identity.
const passionColors = {
  knowledge: '#FFD700',
  architecture: '#A855F7',
  modernization: '#00D9FF',
  performance: '#FF6B2B',
  frontend: '#00FF88',
  teamBuilding: '#FF3366',
  making: '#FF9500'
}

const passions = [
  { key: 'knowledge', color: passionColors.knowledge },
  { key: 'architecture', color: passionColors.architecture },
  { key: 'modernization', color: passionColors.modernization },
  { key: 'performance', color: passionColors.performance },
  { key: 'frontend', color: passionColors.frontend },
  { key: 'teamBuilding', color: passionColors.teamBuilding },
  { key: 'making', color: passionColors.making }
] as const

const carouselRef = ref()
const beaconRef = ref()
const shellRef = ref()
const guideRingRef = ref()
const itemRefs = passions.map(() => ref())

const isMinimal = computed(() => props.quality === 'minimal')

// Geometry detail scales with quality; capped per the budget
// (sphere/ico <=32 high / <=16 low / <=8 minimal; ring radial <=96 high).
const coreSegments = computed(() => (props.quality === 'high' ? 32 : props.quality === 'low' ? 16 : 8))
const sphereSegments = computed(() => (props.quality === 'high' ? 24 : props.quality === 'low' ? 14 : 8))
const torusSegments = computed(() => (props.quality === 'high' ? 16 : props.quality === 'low' ? 10 : 6))
const ringSegments = computed(() => (props.quality === 'high' ? 96 : props.quality === 'low' ? 48 : 24))

// Carousel layout: seven evenly spaced slots on one horizontal ring.
const carouselRadius = 4.2
const slotAngle = (i: number) => (i / passions.length) * Math.PI * 2

// Static slot positions on the ring; computed once (no per-frame allocation).
// The carousel group rotates around Y, so items only need a local bob + spin.
const slotPositions = passions.map((_, i) => {
  const a = slotAngle(i)
  return { x: Math.cos(a) * carouselRadius, z: Math.sin(a) * carouselRadius }
})

// Subtle dust field (single Points draw call). Folds the old dust + energy
// systems into ONE field. Skipped on 'minimal'.
const dustField = shallowRef<Points | null>(null)
const buildDust = () => {
  disposeParticleField(dustField.value)
  dustField.value = null
  if (isMinimal.value) return
  const count = props.quality === 'high' ? 500 : 140
  dustField.value = createParticleField({
    count,
    color: 0xa855f7,
    size: props.quality === 'high' ? 0.04 : 0.06,
    opacity: 0.4,
    additive: true,
    position: (_i, out) => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 6 + Math.random() * 16
      out[0] = r * Math.sin(phi) * Math.cos(theta)
      out[1] = (Math.random() - 0.5) * 9
      out[2] = r * Math.sin(phi) * Math.sin(theta)
    }
  })
}

watch(() => props.quality, buildDust, { immediate: true })

const update = (elapsed: number) => {
  // The whole gallery turns slowly around the vertical axis as one group.
  if (carouselRef.value) carouselRef.value.rotation.y = elapsed * 0.12

  // Each item sits in its fixed slot, bobs on its own sine phase, self-rotates,
  // and counter-rotates against the carousel so it keeps gently facing camera.
  for (let i = 0; i < itemRefs.length; i++) {
    const obj = itemRefs[i].value
    if (!obj) continue
    const slot = slotPositions[i]
    obj.position.x = slot.x
    obj.position.z = slot.z
    obj.position.y = Math.sin(elapsed * 0.7 + i * 0.9) * 0.35
    // Counter the group spin and add a slow self-turn so faces stay toward us.
    obj.rotation.y = -elapsed * 0.12 + Math.sin(elapsed * 0.3 + i) * 0.25
    const s = 1 + Math.sin(elapsed * 1.0 + i * 0.6) * 0.06
    obj.scale.setScalar(s)
  }

  // Restrained central beacon: a single faceted core + one subtle glow shell.
  if (beaconRef.value) {
    beaconRef.value.rotation.y = elapsed * 0.18
    beaconRef.value.rotation.x = Math.sin(elapsed * 0.15) * 0.1
    const p = 1 + Math.sin(elapsed * 1.0) * 0.07
    beaconRef.value.scale.setScalar(p)
  }
  if (shellRef.value) shellRef.value.rotation.y = -elapsed * 0.1

  // One thin guide ring, slowly drifting.
  if (guideRingRef.value) guideRingRef.value.rotation.z = elapsed * 0.04

  if (dustField.value) dustField.value.rotation.y = elapsed * 0.01
}

useSceneAnimation('about', update, () => {
  disposeParticleField(dustField.value)
})

onBeforeUnmount(() => {
  disposeParticleField(dustField.value)
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 2, 12]" :look-at="[0, 0, 0]" />

  <!-- Lean 3-light rig (was 6) -->
  <TresAmbientLight :intensity="0.3" />
  <TresPointLight :position="[0, 0, 2]" :intensity="2.4" :color="themeColors.core" :distance="16" />
  <TresPointLight :position="[6, 5, -3]" :intensity="1" :color="themeColors.beacon" :distance="20" />

  <!-- Restrained central beacon: one faceted core + ONE subtle glow shell -->
  <TresGroup ref="beaconRef">
    <TresMesh>
      <TresIcosahedronGeometry :args="[0.85, 1]" />
      <TresMeshStandardMaterial
        :color="themeColors.core"
        :emissive="themeColors.core"
        :emissive-intensity="0.9"
        :metalness="0.9"
        :roughness="0.15"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh v-if="!isMinimal" ref="shellRef">
      <TresIcosahedronGeometry :args="[1.2, coreSegments > 16 ? 1 : 0]" />
      <TresMeshBasicMaterial
        :color="themeColors.beacon"
        :opacity="0.12"
        :transparent="true"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>

  <!-- ONE thin guide ring beneath the carousel -->
  <TresMesh ref="guideRingRef" :rotation="[Math.PI / 2, 0, 0]">
    <TresTorusGeometry :args="[carouselRadius, 0.012, 6, ringSegments]" />
    <TresMeshBasicMaterial :color="themeColors.ring" :opacity="0.18" :transparent="true" :depth-write="false" />
  </TresMesh>

  <!-- Gallery carousel: seven symbolic passions on one horizontal ring -->
  <TresGroup ref="carouselRef">
    <!-- 1. Knowledge Sharing - Luminous Book Stack -->
    <TresGroup :ref="el => (itemRefs[0].value = el)">
      <TresMesh>
        <TresBoxGeometry :args="[0.9, 1.1, 0.18]" />
        <TresMeshStandardMaterial :color="passionColors.knowledge" :emissive="passionColors.knowledge"
          :emissive-intensity="0.7" :metalness="0.4" :roughness="0.3" />
      </TresMesh>
      <TresMesh v-if="!isMinimal" :position="[0, 0, 0.22]">
        <TresBoxGeometry :args="[0.85, 1.05, 0.15]" />
        <TresMeshStandardMaterial :color="'#FFA500'" :emissive="passionColors.knowledge" :emissive-intensity="0.5"
          :metalness="0.3" :roughness="0.4" />
      </TresMesh>
      <TresMesh v-if="!isMinimal" :position="[0, 0, 0.4]">
        <TresBoxGeometry :args="[0.8, 1.0, 0.12]" />
        <TresMeshStandardMaterial :color="passionColors.knowledge" :emissive="passionColors.knowledge"
          :emissive-intensity="0.6" :metalness="0.4" :roughness="0.3" />
      </TresMesh>
      <!-- single glow shell -->
      <TresMesh v-if="!isMinimal">
        <TresSphereGeometry :args="[1.1, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.knowledge" :opacity="0.13" :transparent="true"
          :depth-write="false" />
      </TresMesh>
    </TresGroup>

    <!-- 2. Architecture - Crystal Temple -->
    <TresGroup :ref="el => (itemRefs[1].value = el)">
      <TresMesh>
        <TresBoxGeometry :args="[0.35, 1.4, 0.35]" />
        <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
          :emissive-intensity="0.6" :metalness="0.8" :roughness="0.2" />
      </TresMesh>
      <TresMesh :position="[-0.55, -0.1, 0]">
        <TresBoxGeometry :args="[0.22, 1.15, 0.22]" />
        <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
          :emissive-intensity="0.5" :metalness="0.7" :roughness="0.25" />
      </TresMesh>
      <TresMesh :position="[0.55, -0.1, 0]">
        <TresBoxGeometry :args="[0.22, 1.15, 0.22]" />
        <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
          :emissive-intensity="0.5" :metalness="0.7" :roughness="0.25" />
      </TresMesh>
      <TresMesh :position="[0, 0.85, 0]">
        <TresBoxGeometry :args="[1.4, 0.18, 0.6]" />
        <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
          :emissive-intensity="0.7" :metalness="0.9" :roughness="0.1" />
      </TresMesh>
      <TresMesh :position="[0, -0.75, 0]">
        <TresBoxGeometry :args="[1.2, 0.1, 0.5]" />
        <TresMeshStandardMaterial :color="passionColors.architecture" :emissive="passionColors.architecture"
          :emissive-intensity="0.4" :metalness="0.6" :roughness="0.3" />
      </TresMesh>
      <TresMesh v-if="!isMinimal">
        <TresSphereGeometry :args="[1.2, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.architecture" :opacity="0.12" :transparent="true"
          :depth-write="false" />
      </TresMesh>
    </TresGroup>

    <!-- 3. Modernization - Energy Cycle Arc -->
    <TresGroup :ref="el => (itemRefs[2].value = el)">
      <TresMesh :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.65, 0.14, torusSegments, isMinimal ? 24 : 48, Math.PI * 1.6]" />
        <TresMeshStandardMaterial :color="passionColors.modernization" :emissive="passionColors.modernization"
          :emissive-intensity="0.8" :metalness="0.6" :roughness="0.2" />
      </TresMesh>
      <TresMesh :position="[0.65, 0, 0]" :rotation="[0, 0, -Math.PI / 3]">
        <TresConeGeometry :args="[0.22, 0.4, 4]" />
        <TresMeshStandardMaterial :color="passionColors.modernization" :emissive="passionColors.modernization"
          :emissive-intensity="0.9" :metalness="0.7" :roughness="0.15" />
      </TresMesh>
      <TresMesh>
        <TresOctahedronGeometry :args="[0.35, 0]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="passionColors.modernization" :emissive-intensity="1.2"
          :metalness="0.9" :roughness="0" />
      </TresMesh>
      <!-- single glow shell -->
      <TresMesh v-if="!isMinimal">
        <TresSphereGeometry :args="[0.95, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.modernization" :opacity="0.13" :transparent="true"
          :depth-write="false" />
      </TresMesh>
    </TresGroup>

    <!-- 4. Performance - Lightning Bolt -->
    <TresGroup :ref="el => (itemRefs[3].value = el)">
      <TresMesh :position="[0, 0.3, 0]" :rotation="[0, 0, Math.PI / 8]">
        <TresBoxGeometry :args="[0.28, 0.9, 0.12]" />
        <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
          :emissive-intensity="1" :metalness="0.9" :roughness="0.05" />
      </TresMesh>
      <TresMesh :position="[0.18, -0.1, 0]" :rotation="[0, 0, -Math.PI / 5]">
        <TresBoxGeometry :args="[0.24, 0.7, 0.1]" />
        <TresMeshStandardMaterial :color="passionColors.performance" :emissive="passionColors.performance"
          :emissive-intensity="1" :metalness="0.9" :roughness="0.05" />
      </TresMesh>
      <TresMesh :position="[0.38, -0.55, 0]" :rotation="[0, 0, Math.PI / 6]">
        <TresConeGeometry :args="[0.12, 0.55, 4]" />
        <TresMeshStandardMaterial :color="'#FFFFFF'" :emissive="passionColors.performance" :emissive-intensity="1.2"
          :metalness="1" :roughness="0" />
      </TresMesh>
      <TresMesh v-if="!isMinimal">
        <TresSphereGeometry :args="[0.9, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.performance" :opacity="0.15" :transparent="true"
          :depth-write="false" />
      </TresMesh>
    </TresGroup>

    <!-- 5. Frontend - Prism Palette -->
    <TresGroup :ref="el => (itemRefs[4].value = el)">
      <TresMesh :rotation="[Math.PI / 6, 0, Math.PI / 8]">
        <TresOctahedronGeometry :args="[0.55, 0]" />
        <TresMeshStandardMaterial :color="passionColors.frontend" :emissive="passionColors.frontend"
          :emissive-intensity="0.6" :metalness="0.5" :roughness="0.3" />
      </TresMesh>
      <template v-if="!isMinimal">
        <TresMesh :position="[0.45, 0.4, 0.25]">
          <TresSphereGeometry :args="[0.14, sphereSegments, sphereSegments]" />
          <TresMeshStandardMaterial :color="'#FF4757'" :emissive="'#FF4757'" :emissive-intensity="0.8" />
        </TresMesh>
        <TresMesh :position="[-0.45, 0.35, 0.2]">
          <TresSphereGeometry :args="[0.12, sphereSegments, sphereSegments]" />
          <TresMeshStandardMaterial :color="'#2ED573'" :emissive="'#2ED573'" :emissive-intensity="0.8" />
        </TresMesh>
        <TresMesh :position="[0, -0.45, 0.3]">
          <TresSphereGeometry :args="[0.13, sphereSegments, sphereSegments]" />
          <TresMeshStandardMaterial :color="'#3742FA'" :emissive="'#3742FA'" :emissive-intensity="0.8" />
        </TresMesh>
        <TresMesh :position="[0.3, -0.2, -0.35]">
          <TresSphereGeometry :args="[0.1, sphereSegments, sphereSegments]" />
          <TresMeshStandardMaterial :color="'#FFA502'" :emissive="'#FFA502'" :emissive-intensity="0.8" />
        </TresMesh>
        <!-- single rainbow glow shell -->
        <TresMesh>
          <TresSphereGeometry :args="[1, sphereSegments, sphereSegments]" />
          <TresMeshBasicMaterial :color="passionColors.frontend" :opacity="0.12" :transparent="true"
            :depth-write="false" />
        </TresMesh>
      </template>
    </TresGroup>

    <!-- 6. Team Building - Connected Nodes -->
    <TresGroup :ref="el => (itemRefs[5].value = el)">
      <TresMesh :position="[0, 0.35, 0]">
        <TresSphereGeometry :args="[0.28, sphereSegments, sphereSegments]" />
        <TresMeshStandardMaterial :color="passionColors.teamBuilding" :emissive="passionColors.teamBuilding"
          :emissive-intensity="0.7" :metalness="0.4" :roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[0, -0.15, 0]">
        <TresCapsuleGeometry :args="[0.22, 0.45, 4, isMinimal ? 8 : 16]" />
        <TresMeshStandardMaterial :color="passionColors.teamBuilding" :emissive="passionColors.teamBuilding"
          :emissive-intensity="0.6" :metalness="0.4" :roughness="0.4" />
      </TresMesh>
      <template v-if="!isMinimal">
        <TresMesh :position="[-0.55, 0.25, -0.2]">
          <TresSphereGeometry :args="[0.2, sphereSegments, sphereSegments]" />
          <TresMeshStandardMaterial :color="'#FF8E72'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
        </TresMesh>
        <TresMesh :position="[-0.55, -0.1, -0.2]">
          <TresCapsuleGeometry :args="[0.16, 0.35, 4, 16]" />
          <TresMeshStandardMaterial :color="'#FF8E72'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
        </TresMesh>
        <TresMesh :position="[0.55, 0.25, -0.2]">
          <TresSphereGeometry :args="[0.2, sphereSegments, sphereSegments]" />
          <TresMeshStandardMaterial :color="'#FFB8A0'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
        </TresMesh>
        <TresMesh :position="[0.55, -0.1, -0.2]">
          <TresCapsuleGeometry :args="[0.16, 0.35, 4, 16]" />
          <TresMeshStandardMaterial :color="'#FFB8A0'" :emissive="passionColors.teamBuilding" :emissive-intensity="0.5" />
        </TresMesh>
        <!-- single team aura -->
        <TresMesh>
          <TresSphereGeometry :args="[1.1, sphereSegments, sphereSegments]" />
          <TresMeshBasicMaterial :color="passionColors.teamBuilding" :opacity="0.1" :transparent="true"
            :depth-write="false" />
        </TresMesh>
      </template>
    </TresGroup>

    <!-- 7. Making - Kinetic Gear -->
    <TresGroup :ref="el => (itemRefs[6].value = el)">
      <TresMesh :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.45, 0.18, 8, isMinimal ? 6 : 10]" />
        <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making"
          :emissive-intensity="0.5" :metalness="0.9" :roughness="0.2" />
      </TresMesh>
      <TresMesh v-if="!isMinimal" :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.62, 0.1, 6, 12]" />
        <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making"
          :emissive-intensity="0.6" :metalness="0.95" :roughness="0.15" />
      </TresMesh>
      <TresMesh>
        <TresCylinderGeometry :args="[0.18, 0.18, 0.35, isMinimal ? 6 : 8]" />
        <TresMeshStandardMaterial :color="'#CD853F'" :emissive="passionColors.making" :emissive-intensity="0.4"
          :metalness="0.95" :roughness="0.1" />
      </TresMesh>
      <TresMesh :position="[0.75, 0, 0]">
        <TresBoxGeometry :args="[0.85, 0.14, 0.1]" />
        <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making"
          :emissive-intensity="0.5" :metalness="0.8" :roughness="0.3" />
      </TresMesh>
      <TresMesh :position="[1.15, 0, 0]" :rotation="[0, 0, Math.PI / 4]">
        <TresBoxGeometry :args="[0.25, 0.25, 0.08]" />
        <TresMeshStandardMaterial :color="passionColors.making" :emissive="passionColors.making"
          :emissive-intensity="0.6" :metalness="0.9" :roughness="0.2" />
      </TresMesh>
      <TresMesh v-if="!isMinimal">
        <TresSphereGeometry :args="[1, sphereSegments, sphereSegments]" />
        <TresMeshBasicMaterial :color="passionColors.making" :opacity="0.12" :transparent="true"
          :depth-write="false" />
      </TresMesh>
    </TresGroup>
  </TresGroup>

  <!-- Subtle dust field (single draw call) -->
  <primitive v-if="dustField" :object="dustField" />
</template>
