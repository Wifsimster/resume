<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'

const props = defineProps<{
  quality: QualityLevel
}>()

// Main refs
const sceneRef = ref()
const openBookRef = ref()
const leftPageRef = ref()
const rightPageRef = ref()
const orbitingBooksRef = ref<any[]>([])
const knowledgeParticlesRef = ref<any[]>([])
const quillRef = ref()

// Orbiting books configuration
const orbitingBooks = [
  { radius: 2.8, speed: 0.25, yOffset: 0, color: '#1E3A5F', emissive: '#0D47A1', tilt: 0.3 },
  { radius: 3.2, speed: -0.18, yOffset: 0.5, color: '#4A1942', emissive: '#6A1B9A', tilt: -0.2 },
  { radius: 2.5, speed: 0.32, yOffset: -0.3, color: '#2E4A32', emissive: '#1B5E20', tilt: 0.15 },
  { radius: 3.5, speed: -0.15, yOffset: 0.8, color: '#5D3A1A', emissive: '#8B4513', tilt: -0.4 },
  { radius: 2.2, speed: 0.4, yOffset: -0.6, color: '#8B0000', emissive: '#C62828', tilt: 0.25 },
  { radius: 3.8, speed: 0.12, yOffset: 1.1, color: '#1A3A4A', emissive: '#006064', tilt: -0.1 },
]

// Knowledge particles that rise from open book
const particleCount = computed(() => props.quality === 'high' ? 40 : 20)
const knowledgeParticles = reactive<Array<{ x: number, y: number, z: number, speed: number, char: string, opacity: number }>>([])

// Characters that represent "knowledge" - mix of letters, symbols, code
const knowledgeChars = ['α', 'β', 'γ', 'δ', 'λ', 'π', 'Σ', '∞', '→', '≡', '∂', '∫', '{', '}', '<', '>', '/', '*', '=', '+']

const initParticles = () => {
  knowledgeParticles.length = 0
  for (let i = 0; i < particleCount.value; i++) {
    knowledgeParticles.push({
      x: (Math.random() - 0.5) * 1.2,
      y: Math.random() * 4,
      z: (Math.random() - 0.5) * 0.8,
      speed: 0.3 + Math.random() * 0.5,
      char: knowledgeChars[Math.floor(Math.random() * knowledgeChars.length)],
      opacity: Math.random()
    })
  }
}

let animationId: number
let startTime = 0

const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000

  // Scene gentle rotation
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.1) * 0.15
  }

  // Open book hover animation
  if (openBookRef.value) {
    openBookRef.value.position.y = Math.sin(elapsed * 0.8) * 0.08
    openBookRef.value.rotation.z = Math.sin(elapsed * 0.5) * 0.02
  }

  // Page flutter animation
  if (leftPageRef.value && rightPageRef.value) {
    const pageFlutter = Math.sin(elapsed * 2.5) * 0.05
    leftPageRef.value.rotation.y = -0.4 + pageFlutter
    rightPageRef.value.rotation.y = 0.4 - pageFlutter
  }

  // Orbiting books animation
  orbitingBooksRef.value.forEach((bookRef, index) => {
    if (bookRef) {
      const book = orbitingBooks[index]
      const angle = elapsed * book.speed
      bookRef.position.x = Math.cos(angle) * book.radius
      bookRef.position.z = Math.sin(angle) * book.radius
      bookRef.position.y = book.yOffset + Math.sin(elapsed * 0.6 + index) * 0.2
      bookRef.rotation.y = -angle + Math.PI / 2
      bookRef.rotation.x = Math.sin(elapsed * 0.4 + index * 0.5) * 0.1
      bookRef.rotation.z = book.tilt + Math.sin(elapsed * 0.3 + index) * 0.05
    }
  })

  // Knowledge particles rising animation
  knowledgeParticlesRef.value.forEach((particleRef, index) => {
    if (particleRef && knowledgeParticles[index]) {
      const particle = knowledgeParticles[index]
      particle.y += particle.speed * 0.016
      particle.opacity = Math.sin((particle.y / 4) * Math.PI) * 0.8

      // Reset particle when it goes too high
      if (particle.y > 4) {
        particle.y = 0
        particle.x = (Math.random() - 0.5) * 1.2
        particle.z = (Math.random() - 0.5) * 0.8
        particle.speed = 0.3 + Math.random() * 0.5
        particle.char = knowledgeChars[Math.floor(Math.random() * knowledgeChars.length)]
      }

      particleRef.position.y = particle.y + 0.3
      particleRef.position.x = particle.x + Math.sin(elapsed * 2 + index * 0.3) * 0.1
      particleRef.position.z = particle.z
    }
  })

  // Quill writing animation
  if (quillRef.value) {
    quillRef.value.position.y = 2.5 + Math.sin(elapsed * 1.2) * 0.15
    quillRef.value.rotation.z = Math.sin(elapsed * 0.8) * 0.2 - 0.3
    quillRef.value.rotation.x = Math.sin(elapsed * 1.5) * 0.1
  }

  animationId = requestAnimationFrame(animate)
}

const setOrbitingBookRef = (el: any, index: number) => {
  if (el) {
    orbitingBooksRef.value[index] = el
  }
}

const setParticleRef = (el: any, index: number) => {
  if (el) {
    knowledgeParticlesRef.value[index] = el
  }
}

onMounted(() => {
  initParticles()
  startTime = Date.now()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

const segmentCount = computed(() => props.quality === 'high' ? 32 : 16)
</script>

<template>
  <TresPerspectiveCamera :position="[0, 2, 7]" :look-at="[0, 0.5, 0]" />

  <!-- Ambient and accent lighting -->
  <TresAmbientLight :intensity="0.2" />
  <TresPointLight :position="[0, 5, 0]" :intensity="0.8" color="#FFE4B5" />
  <TresPointLight :position="[-4, 3, 3]" :intensity="0.5" color="#A855F7" />
  <TresPointLight :position="[4, 2, 2]" :intensity="0.4" color="#3B82F6" />
  <TresPointLight :position="[0, 1, 4]" :intensity="0.6" color="#FBBF24" />
  <TresSpotLight 
    :position="[0, 6, 2]" 
    :intensity="1.2" 
    :angle="0.5" 
    :penumbra="0.8" 
    color="#FFF8DC"
    :target-position="[0, 0, 0]"
  />

  <TresGroup ref="sceneRef">
    <!-- Central Open Book -->
    <TresGroup ref="openBookRef" :position="[0, 0, 0]">
      <!-- Book spine -->
      <TresMesh :position="[0, -0.02, 0]">
        <TresBoxGeometry :args="[0.1, 0.08, 1.4]" />
        <TresMeshStandardMaterial
          :color="'#8B4513'"
          :roughness="0.7"
          :metalness="0.2"
        />
      </TresMesh>

      <!-- Left cover -->
      <TresGroup ref="leftPageRef" :position="[-0.05, 0, 0]">
        <TresMesh :position="[-0.45, 0, 0]" :rotation="[0, -0.4, 0]">
          <TresBoxGeometry :args="[0.9, 0.04, 1.3]" />
          <TresMeshStandardMaterial
            :color="'#6B3A19'"
            :roughness="0.6"
            :metalness="0.1"
          />
        </TresMesh>
        <!-- Left pages -->
        <TresMesh :position="[-0.42, 0.03, 0]" :rotation="[0, -0.4, 0]">
          <TresBoxGeometry :args="[0.82, 0.05, 1.2]" />
          <TresMeshStandardMaterial
            :color="'#FFF8E7'"
            :roughness="0.95"
            :emissive="'#FBBF24'"
            :emissive-intensity="0.05"
          />
        </TresMesh>
        <!-- Page lines (text representation) -->
        <TresMesh v-for="i in 6" :key="`left-line-${i}`" 
          :position="[-0.42, 0.06, -0.4 + i * 0.13]" 
          :rotation="[0, -0.4, 0]">
          <TresBoxGeometry :args="[0.6, 0.005, 0.02]" />
          <TresMeshBasicMaterial :color="'#8B7355'" :opacity="0.5" :transparent="true" />
        </TresMesh>
      </TresGroup>

      <!-- Right cover -->
      <TresGroup ref="rightPageRef" :position="[0.05, 0, 0]">
        <TresMesh :position="[0.45, 0, 0]" :rotation="[0, 0.4, 0]">
          <TresBoxGeometry :args="[0.9, 0.04, 1.3]" />
          <TresMeshStandardMaterial
            :color="'#6B3A19'"
            :roughness="0.6"
            :metalness="0.1"
          />
        </TresMesh>
        <!-- Right pages -->
        <TresMesh :position="[0.42, 0.03, 0]" :rotation="[0, 0.4, 0]">
          <TresBoxGeometry :args="[0.82, 0.05, 1.2]" />
          <TresMeshStandardMaterial
            :color="'#FFF8E7'"
            :roughness="0.95"
            :emissive="'#FBBF24'"
            :emissive-intensity="0.05"
          />
        </TresMesh>
        <!-- Page lines (text representation) -->
        <TresMesh v-for="i in 6" :key="`right-line-${i}`" 
          :position="[0.42, 0.06, -0.4 + i * 0.13]" 
          :rotation="[0, 0.4, 0]">
          <TresBoxGeometry :args="[0.6, 0.005, 0.02]" />
          <TresMeshBasicMaterial :color="'#8B7355'" :opacity="0.5" :transparent="true" />
        </TresMesh>
      </TresGroup>

      <!-- Magical glow from book -->
      <TresMesh :position="[0, 0.3, 0]">
        <TresSphereGeometry :args="[0.8, segmentCount, segmentCount]" />
        <TresMeshBasicMaterial :color="'#FBBF24'" :opacity="0.08" :transparent="true" />
      </TresMesh>
      <TresMesh :position="[0, 0.5, 0]">
        <TresSphereGeometry :args="[1.2, segmentCount, segmentCount]" />
        <TresMeshBasicMaterial :color="'#A855F7'" :opacity="0.04" :transparent="true" />
      </TresMesh>
    </TresGroup>

    <!-- Knowledge particles rising from the book -->
    <TresGroup :position="[0, 0, 0]">
      <TresMesh
        v-for="(particle, index) in knowledgeParticles"
        :key="`particle-${index}`"
        :ref="(el) => setParticleRef(el, index)"
        :position="[particle.x, particle.y + 0.3, particle.z]"
      >
        <TresPlaneGeometry :args="[0.12, 0.12]" />
        <TresMeshBasicMaterial
          :color="index % 3 === 0 ? '#FBBF24' : index % 3 === 1 ? '#A855F7' : '#3B82F6'"
          :opacity="particle.opacity * 0.7"
          :transparent="true"
          :side="2"
        />
      </TresMesh>
    </TresGroup>

    <!-- Orbiting Books -->
    <TresGroup
      v-for="(book, index) in orbitingBooks"
      :key="`orbit-book-${index}`"
      :ref="(el) => setOrbitingBookRef(el, index)"
      :position="[book.radius, book.yOffset, 0]"
    >
      <!-- Book cover -->
      <TresMesh>
        <TresBoxGeometry :args="[0.35, 0.5, 0.08]" />
        <TresMeshStandardMaterial
          :color="book.color"
          :emissive="book.emissive"
          :emissive-intensity="0.25"
          :roughness="0.6"
          :metalness="0.2"
        />
      </TresMesh>
      <!-- Book pages (side) -->
      <TresMesh :position="[0.01, 0, 0]">
        <TresBoxGeometry :args="[0.32, 0.46, 0.06]" />
        <TresMeshStandardMaterial :color="'#F5F5DC'" :roughness="0.9" />
      </TresMesh>
      <!-- Spine detail -->
      <TresMesh :position="[-0.17, 0, 0]">
        <TresBoxGeometry :args="[0.02, 0.52, 0.09]" />
        <TresMeshStandardMaterial
          :color="book.emissive"
          :roughness="0.5"
          :metalness="0.3"
        />
      </TresMesh>
      <!-- Subtle glow -->
      <TresMesh>
        <TresSphereGeometry :args="[0.4, 8, 8]" />
        <TresMeshBasicMaterial :color="book.emissive" :opacity="0.08" :transparent="true" />
      </TresMesh>
    </TresGroup>

    <!-- Floating Quill -->
    <TresGroup ref="quillRef" :position="[1.8, 2.5, 0.5]" :rotation="[0.2, -0.5, -0.3]">
      <!-- Feather shaft -->
      <TresMesh>
        <TresCylinderGeometry :args="[0.015, 0.008, 0.8, 8]" />
        <TresMeshStandardMaterial :color="'#F5F5DC'" :roughness="0.4" />
      </TresMesh>
      <!-- Feather tip (nib) -->
      <TresMesh :position="[0, -0.42, 0]" :rotation="[0, 0, 0]">
        <TresConeGeometry :args="[0.015, 0.08, 8]" />
        <TresMeshStandardMaterial :color="'#B87333'" :metalness="0.8" :roughness="0.2" />
      </TresMesh>
      <!-- Feather barbs (simplified) -->
      <TresMesh :position="[0.08, 0.2, 0]" :rotation="[0, 0, 0.3]">
        <TresPlaneGeometry :args="[0.15, 0.5]" />
        <TresMeshStandardMaterial 
          :color="'#E8E4D9'" 
          :roughness="0.8" 
          :side="2"
          :opacity="0.9"
          :transparent="true"
        />
      </TresMesh>
      <TresMesh :position="[-0.06, 0.2, 0]" :rotation="[0, 0, -0.25]">
        <TresPlaneGeometry :args="[0.12, 0.45]" />
        <TresMeshStandardMaterial 
          :color="'#E8E4D9'" 
          :roughness="0.8" 
          :side="2"
          :opacity="0.9"
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>

    <!-- Floating bookmarks -->
    <TresMesh 
      v-for="i in 3" 
      :key="`bookmark-${i}`"
      :position="[
        Math.cos(i * 2.1) * 2.2,
        1.5 + i * 0.4,
        Math.sin(i * 2.1) * 1.5
      ]"
      :rotation="[0.2, i * 0.7, 0.1]"
    >
      <TresPlaneGeometry :args="[0.08, 0.4]" />
      <TresMeshStandardMaterial
        :color="i === 0 ? '#DC2626' : i === 1 ? '#7C3AED' : '#059669'"
        :emissive="i === 0 ? '#DC2626' : i === 1 ? '#7C3AED' : '#059669'"
        :emissive-intensity="0.3"
        :side="2"
      />
    </TresMesh>

    <!-- Orbit ring trails (ethereal) -->
    <TresMesh 
      v-for="(book, i) in orbitingBooks" 
      :key="`ring-${i}`" 
      :position="[0, book.yOffset, 0]" 
      :rotation="[-Math.PI / 2, 0, 0]"
    >
      <TresTorusGeometry :args="[book.radius, 0.008, 8, 64]" />
      <TresMeshBasicMaterial :color="book.emissive" :opacity="0.15" :transparent="true" />
    </TresMesh>
  </TresGroup>

  <!-- Floor with mystical pattern -->
  <TresMesh :position="[0, -1.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresCircleGeometry :args="[8, segmentCount]" />
    <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.95" />
  </TresMesh>

  <!-- Concentric floor rings (library pattern) -->
  <TresMesh 
    v-for="i in 4" 
    :key="`floor-ring-${i}`" 
    :position="[0, -1.48, 0]" 
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresTorusGeometry :args="[1 + i * 1.5, 0.02, 8, 64]" />
    <TresMeshBasicMaterial :color="'#FBBF24'" :opacity="0.1" :transparent="true" />
  </TresMesh>

  <!-- Ambient floating dust/sparkles -->
  <TresMesh
    v-for="i in (quality === 'high' ? 30 : 15)"
    :key="`sparkle-${i}`"
    :position="[
      (Math.random() - 0.5) * 8,
      Math.random() * 5 - 1,
      (Math.random() - 0.5) * 6
    ]"
  >
    <TresSphereGeometry :args="[0.02, 4, 4]" />
    <TresMeshBasicMaterial 
      :color="i % 3 === 0 ? '#FBBF24' : i % 3 === 1 ? '#A855F7' : '#FFFFFF'" 
      :opacity="0.4 + Math.random() * 0.3" 
      :transparent="true" 
    />
  </TresMesh>
</template>

