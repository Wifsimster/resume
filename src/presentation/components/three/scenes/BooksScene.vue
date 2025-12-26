<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { QualityLevel } from '@application/composables/useQuality'
import { resumeData } from '@domain/data/resume'
import { useAnimationController } from '@application/composables/useAnimationController'

const props = defineProps<{
  quality: QualityLevel
}>()

// Get section element for visibility detection
const sectionElement = ref<HTMLElement | null>(null)

// Animation controller
const animationController = useAnimationController(sectionElement)

// Main refs
const sceneRef = ref()
const bookshelfRef = ref()
const floatingBooksRef = ref<any[]>([])
const openBookRef = ref()
const leftPageRef = ref()
const rightPageRef = ref()
const pageTurnRefs = ref<any[]>([])
const readingLightRef = ref()
const bookGlowRefs = ref<any[]>([])

// Book colors based on status and theme
const getBookColor = (status: string, index: number) => {
  const readColors = [
    { cover: '#2C3E50', spine: '#34495E', emissive: '#3498DB' }, // Clean Architecture - Blue
    { cover: '#8B4513', spine: '#A0522D', emissive: '#D2691E' }, // Pragmatic Programmer - Brown
    { cover: '#1A237E', spine: '#283593', emissive: '#3949AB' }, // Philosophy - Indigo
  ]
  const toReadColors = [
    { cover: '#4A148C', spine: '#6A1B9A', emissive: '#7B1FA2' }, // $100M Leads - Purple
    { cover: '#1B5E20', spine: '#2E7D32', emissive: '#388E3C' }, // Data Intensive - Green
    { cover: '#B71C1C', spine: '#C62828', emissive: '#D32F2F' }, // Company of One - Red
  ]
  
  if (status === 'read') {
    return readColors[index % readColors.length]
  }
  return toReadColors[index % toReadColors.length]
}

// Create floating books from actual resume data
const floatingBooks = resumeData.books.map((book, index) => {
  const colors = getBookColor(book.status, index)
  const angle = (index / resumeData.books.length) * Math.PI * 2
  const radius = 2.5 + (index % 3) * 0.8
  const yOffset = -0.5 + (index % 4) * 0.4
  
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    angle,
    radius,
    yOffset,
    speed: 0.15 + (index % 3) * 0.05,
    direction: index % 2 === 0 ? 1 : -1,
    colors,
    thickness: 0.12 + (index % 3) * 0.03,
    width: 0.4,
    height: 0.6
  }
})

// Page turning animation for open book
const pageCount = 20
// Initialize page refs array immediately
pageTurnRefs.value = Array.from({ length: pageCount }, () => null)

// Helper function to set page ref
const setPageRef = (index: number, el: any) => {
  if (el && pageTurnRefs.value) {
    pageTurnRefs.value[index] = el
  }
}


let startTime = 0

const updateAnimations = (elapsed: number, delta: number) => {
  // Gentle scene rotation - like viewing a library
  if (sceneRef.value) {
    sceneRef.value.rotation.y = Math.sin(elapsed * 0.08) * 0.1
  }

  // Bookshelf subtle sway
  if (bookshelfRef.value) {
    bookshelfRef.value.position.y = Math.sin(elapsed * 0.3) * 0.02
  }

  // Floating books - smooth orbit around center
  floatingBooksRef.value.forEach((bookRef, index) => {
    if (bookRef && floatingBooks[index]) {
      const book = floatingBooks[index]
      const angle = book.angle + elapsed * book.speed * book.direction
      
      // Smooth circular orbit
      bookRef.position.x = Math.cos(angle) * book.radius
      bookRef.position.z = Math.sin(angle) * book.radius
      
      // Smooth vertical float
      bookRef.position.y = book.yOffset + Math.sin(elapsed * 0.4 + index * 0.4) * 0.12
      
      // Book rotation - always face outward with smooth movement
      bookRef.rotation.y = -angle + Math.PI / 2
      bookRef.rotation.x = Math.sin(elapsed * 0.3 + index * 0.5) * 0.06
      bookRef.rotation.z = Math.sin(elapsed * 0.25 + index * 0.6) * 0.04
      
      // Subtle scale pulse for read books
      if (book.status === 'read') {
        const pulse = 1 + Math.sin(elapsed * 1.0 + index * 0.7) * 0.02
        bookRef.scale.set(pulse, pulse, pulse)
      }
    }
  })

  // Open book - smooth floating and gentle rotation
  if (openBookRef.value) {
    openBookRef.value.position.y = 0.5 + Math.sin(elapsed * 0.5) * 0.08
    openBookRef.value.rotation.y = Math.sin(elapsed * 0.08) * 0.1
  }

  // Page flutter - smooth, realistic page movement
  if (leftPageRef.value && rightPageRef.value) {
    const pageFlutter = Math.sin(elapsed * 1.2) * 0.02
    leftPageRef.value.rotation.y = -0.35 + pageFlutter
    rightPageRef.value.rotation.y = 0.35 - pageFlutter
  }

  // Page turning animation - smooth sequential pages turning
  pageTurnRefs.value.forEach((pageRef, index) => {
    if (pageRef) {
      const pagePhase = ((elapsed * 0.25 + index * 0.08) % 1)
      const isTurning = pagePhase < 0.4
      
      if (isTurning) {
        const turnProgress = pagePhase / 0.4
        // Smooth easing for page turn
        const eased = turnProgress < 0.5 
          ? 2 * turnProgress * turnProgress 
          : 1 - Math.pow(-2 * turnProgress + 2, 2) / 2
        pageRef.rotation.y = -0.35 + eased * 0.7
        pageRef.position.x = -0.05 + eased * 0.1
      } else {
        pageRef.rotation.y = 0.35
        pageRef.position.x = 0.05
      }
    }
  })

  // Reading light - warm glow that moves
  if (readingLightRef.value) {
    readingLightRef.value.position.y = 1.2 + Math.sin(elapsed * 0.4) * 0.1
    readingLightRef.value.intensity = 0.8 + Math.sin(elapsed * 1.5) * 0.2
  }

  // Book glows - subtle pulsing for read books
  bookGlowRefs.value.forEach((glowRef, index) => {
    if (glowRef && floatingBooks[index]?.status === 'read') {
      const pulse = 0.15 + Math.sin(elapsed * 1.5 + index) * 0.05
      if (glowRef.material) {
        glowRef.material.opacity = pulse
      }
    }
  })
}

const setFloatingBookRef = (el: any, index: number) => {
  if (el) {
    floatingBooksRef.value[index] = el
  }
}

const setBookGlowRef = (el: any, index: number) => {
  if (el) {
    bookGlowRefs.value[index] = el
  }
}
void setBookGlowRef // Used in template

onMounted(() => {
  // Find the parent section element
  const canvas = document.querySelector('[data-section="books"]')
  if (canvas) {
    sectionElement.value = canvas as HTMLElement
  }
  
  startTime = Date.now()
  
  // Start animation loop with controller
  animationController.start((elapsed, delta) => {
    const totalElapsed = (Date.now() - startTime) / 1000
    updateAnimations(totalElapsed, delta)
  })
})

onUnmounted(() => {
  animationController.stop()
})

const segmentCount = computed(() => props.quality === 'high' ? 48 : 16)
</script>

<template>
  <TresPerspectiveCamera :position="[0, 1.5, 8]" :look-at="[0, 0, 0]" />

  <!-- Library lighting - warm and cozy -->
  <TresAmbientLight :intensity="0.15" />
  <!-- Reading lamp - warm golden light -->
  <TresPointLight 
    ref="readingLightRef"
    :position="[0, 1.5, 2]" 
    :intensity="0.9" 
    color="#FFE4B5" 
    :distance="8"
    :decay="2"
  />
  <!-- Accent lights from books -->
  <TresPointLight :position="[-3, 1, 2]" :intensity="0.4" color="#3498DB" :distance="6" />
  <TresPointLight :position="[3, 1, 2]" :intensity="0.4" color="#7B1FA2" :distance="6" />
  <!-- Backlight for depth -->
  <TresPointLight :position="[0, 2, -3]" :intensity="0.3" color="#FBBF24" :distance="10" />

  <TresGroup ref="sceneRef">
    <!-- Central Open Book - main focus -->
    <TresGroup ref="openBookRef" :position="[0, 0.5, 0]">
      <!-- Book spine -->
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[0.12, 0.1, 1.5]" />
        <TresMeshStandardMaterial
          :color="'#8B4513'"
          :roughness="0.7"
          :metalness="0.2"
        />
      </TresMesh>

      <!-- Left cover and pages -->
      <TresGroup ref="leftPageRef" :position="[-0.06, 0, 0]">
        <!-- Cover -->
        <TresMesh :position="[-0.5, 0, 0]" :rotation="[0, -0.35, 0]">
          <TresBoxGeometry :args="[1, 0.05, 1.4]" />
          <TresMeshStandardMaterial
            :color="'#6B3A19'"
            :roughness="0.6"
            :metalness="0.1"
          />
        </TresMesh>
        <!-- Pages stack -->
        <TresMesh :position="[-0.48, 0.02, 0]" :rotation="[0, -0.35, 0]">
          <TresBoxGeometry :args="[0.92, 0.08, 1.3]" />
          <TresMeshStandardMaterial
            :color="'#FFF8E7'"
            :roughness="0.95"
            :emissive="'#FBBF24'"
            :emissive-intensity="0.08"
          />
        </TresMesh>
        <!-- Text lines -->
        <TresMesh 
          v-for="i in 8" 
          :key="`left-line-${i}`" 
          :position="[-0.48, 0.06, -0.5 + i * 0.15]" 
          :rotation="[0, -0.35, 0]"
        >
          <TresBoxGeometry :args="[0.7, 0.003, 0.015]" />
          <TresMeshBasicMaterial :color="'#8B7355'" :opacity="0.4" :transparent="true" />
        </TresMesh>
      </TresGroup>

      <!-- Right cover and pages -->
      <TresGroup ref="rightPageRef" :position="[0.06, 0, 0]">
        <!-- Cover -->
        <TresMesh :position="[0.5, 0, 0]" :rotation="[0, 0.35, 0]">
          <TresBoxGeometry :args="[1, 0.05, 1.4]" />
          <TresMeshStandardMaterial
            :color="'#6B3A19'"
            :roughness="0.6"
            :metalness="0.1"
          />
        </TresMesh>
        <!-- Pages stack -->
        <TresMesh :position="[0.48, 0.02, 0]" :rotation="[0, 0.35, 0]">
          <TresBoxGeometry :args="[0.92, 0.08, 1.3]" />
          <TresMeshStandardMaterial
            :color="'#FFF8E7'"
            :roughness="0.95"
            :emissive="'#FBBF24'"
            :emissive-intensity="0.08"
          />
        </TresMesh>
        <!-- Text lines -->
        <TresMesh 
          v-for="i in 8" 
          :key="`right-line-${i}`" 
          :position="[0.48, 0.06, -0.5 + i * 0.15]" 
          :rotation="[0, 0.35, 0]"
        >
          <TresBoxGeometry :args="[0.7, 0.003, 0.015]" />
          <TresMeshBasicMaterial :color="'#8B7355'" :opacity="0.4" :transparent="true" />
        </TresMesh>
      </TresGroup>

      <!-- Individual pages turning -->
      <TresGroup v-for="(_, index) in pageCount" :key="`page-${index}`">
        <TresMesh 
          :ref="(el) => setPageRef(index, el)"
          :position="[0.05 - ((index + 1) / pageCount) * 0.1, 0.02 + ((index + 1) / pageCount) * 0.001, 0]" 
          :rotation="[0, 0.35, 0]"
        >
          <TresPlaneGeometry :args="[0.9, 1.3]" />
          <TresMeshBasicMaterial 
            :color="'#FFF8E7'" 
            :opacity="0.9 - ((index + 1) / pageCount) * 0.3" 
            :transparent="true" 
            :side="2"
          />
        </TresMesh>
      </TresGroup>

      <!-- Warm glow from open book -->
      <TresMesh :position="[0, 0.3, 0]">
        <TresSphereGeometry :args="[0.9, segmentCount, segmentCount]" />
        <TresMeshBasicMaterial :color="'#FBBF24'" :opacity="0.12" :transparent="true" />
      </TresMesh>
    </TresGroup>

    <!-- Bookshelf background -->
    <TresGroup ref="bookshelfRef" :position="[0, -0.5, -2]">
      <!-- Shelf structure -->
      <TresMesh :position="[0, 0.8, 0]">
        <TresBoxGeometry :args="[6, 0.1, 0.3]" />
        <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.8" :metalness="0.1" />
      </TresMesh>
      <TresMesh :position="[0, 0.2, 0]">
        <TresBoxGeometry :args="[6, 0.1, 0.3]" />
        <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.8" :metalness="0.1" />
      </TresMesh>
      <TresMesh :position="[0, -0.4, 0]">
        <TresBoxGeometry :args="[6, 0.1, 0.3]" />
        <TresMeshStandardMaterial :color="'#3E2723'" :roughness="0.8" :metalness="0.1" />
      </TresMesh>
      <!-- Side supports -->
      <TresMesh :position="[-3, 0.2, 0]">
        <TresBoxGeometry :args="[0.1, 1.3, 0.3]" />
        <TresMeshStandardMaterial :color="'#2E1B14'" :roughness="0.8" />
      </TresMesh>
      <TresMesh :position="[3, 0.2, 0]">
        <TresBoxGeometry :args="[0.1, 1.3, 0.3]" />
        <TresMeshStandardMaterial :color="'#2E1B14'" :roughness="0.8" />
      </TresMesh>
    </TresGroup>


    <!-- Floating Books - from actual resume data -->
    <TresGroup
      v-for="(book, index) in floatingBooks"
      :key="`book-${book.id}`"
      :ref="(el) => setFloatingBookRef(el, index)"
      :position="[Math.cos(book.angle) * book.radius, book.yOffset, Math.sin(book.angle) * book.radius]"
    >
      <!-- Book cover (front) -->
      <TresMesh>
        <TresBoxGeometry :args="[book.width, book.height, book.thickness]" />
        <TresMeshStandardMaterial
          :color="book.colors.cover"
          :emissive="book.colors.emissive"
          :emissive-intensity="book.status === 'read' ? 0.3 : 0.15"
          :roughness="0.6"
          :metalness="0.2"
        />
      </TresMesh>
      <!-- Book pages (side) -->
      <TresMesh :position="[0, 0, book.thickness / 2 + 0.01]">
        <TresBoxGeometry :args="[book.width * 0.95, book.height * 0.95, 0.02]" />
        <TresMeshStandardMaterial :color="'#F5F5DC'" :roughness="0.9" />
      </TresMesh>
      <!-- Spine -->
      <TresMesh :position="[-book.width / 2, 0, 0]">
        <TresBoxGeometry :args="[0.03, book.height, book.thickness]" />
        <TresMeshStandardMaterial
          :color="book.colors.spine"
          :roughness="0.5"
          :metalness="0.3"
        />
      </TresMesh>
      <!-- Glow for read books -->
      <TresMesh 
        v-if="book.status === 'read'"
        :ref="(el) => setBookGlowRef(el, index)"
      >
        <TresSphereGeometry :args="[book.width * 1.2, 16, 16]" />
        <TresMeshBasicMaterial 
          :color="book.colors.emissive" 
          :opacity="0.15" 
          :transparent="true" 
        />
      </TresMesh>
    </TresGroup>

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

</template>

