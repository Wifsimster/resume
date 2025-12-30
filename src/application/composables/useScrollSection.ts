import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useAchievements } from './useAchievements'

export interface Section {
  id: string
  name: string
  visited: boolean
}

const sections: Section[] = [
  { id: 'hero', name: 'Hero', visited: false },
  { id: 'about', name: 'About', visited: false },
  { id: 'motivation', name: 'Motivation', visited: false },
  { id: 'experience', name: 'Experience', visited: false },
  { id: 'skills', name: 'Skills', visited: false },
  { id: 'maker', name: 'Maker', visited: false },
  { id: 'projects', name: 'Projects', visited: false },
  { id: 'books', name: 'Books', visited: false },
  { id: 'contact', name: 'Contact', visited: false }
]

const currentSectionIndex = ref(0)
const scrollProgress = ref(0)
const visitedSections = ref<Set<string>>(new Set(['hero']))
const startTime = ref<number | null>(null)
const sectionVisibility = ref<Map<string, boolean>>(new Map())

// Singleton pattern to ensure scroll listener is only registered once
let scrollListenerRegistered = false
let scrollListenerCleanup: (() => void) | null = null
let unlockAchievement: ((achievementId: string) => void) | null = null

const handleScroll = () => {
  // Calculate overall scroll progress
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
  
  // Determine current section based on scroll position
  const sectionElements = document.querySelectorAll('[data-section]')
  if (sectionElements.length === 0) return
  
  const viewportMiddle = window.innerHeight / 2
  let bestMatch: { index: number; distance: number } | null = null
  
  // Find the section closest to the viewport center
  sectionElements.forEach((el, index) => {
    const rect = el.getBoundingClientRect()
    const sectionCenter = rect.top + rect.height / 2
    const distance = Math.abs(viewportMiddle - sectionCenter)
    
    // Also check if section is significantly visible (at least 30% in viewport)
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    const visibilityRatio = visibleHeight / rect.height
    
    if (visibilityRatio >= 0.3) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { index, distance }
      }
    }
  })
  
  // If no section is significantly visible, find the one closest to viewport center
  if (!bestMatch) {
    sectionElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      const sectionCenter = rect.top + rect.height / 2
      const distance = Math.abs(viewportMiddle - sectionCenter)
      
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { index, distance }
      }
    })
  }
  
  if (bestMatch && currentSectionIndex.value !== bestMatch.index) {
    currentSectionIndex.value = bestMatch.index
    const sectionId = sectionElements[bestMatch.index].getAttribute('data-section')
    if (sectionId) {
      markSectionVisited(sectionId)
    }
  }
  
  // Check for speed runner achievement
  if (startTime.value && scrollProgress.value >= 99 && unlockAchievement) {
    const elapsed = (Date.now() - startTime.value) / 1000
    if (elapsed < 30) {
      unlockAchievement('speedRunner')
    }
  }
}

const markSectionVisited = (sectionId: string) => {
  if (!visitedSections.value.has(sectionId)) {
    visitedSections.value.add(sectionId)
    
    // Update section object
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      section.visited = true
    }
    
    // Check if all sections visited
    if (visitedSections.value.size === sections.length && unlockAchievement) {
      unlockAchievement('explorer')
    }
  }
}

const registerScrollListener = () => {
  if (scrollListenerRegistered) return
  
  startTime.value = Date.now()
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Initial check
  
  scrollListenerRegistered = true
  scrollListenerCleanup = () => {
    window.removeEventListener('scroll', handleScroll)
    scrollListenerRegistered = false
  }
}

export function useScrollSection() {
  const { unlock } = useAchievements()
  
  // Store unlock function for use in scroll handler
  if (!unlockAchievement) {
    unlockAchievement = unlock
  }
  
  const currentSection = computed(() => sections[currentSectionIndex.value])
  const totalSections = computed(() => sections.length)
  
  const progressPercent = computed(() => {
    return ((currentSectionIndex.value + 1) / totalSections.value) * 100
  })
  
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  const scrollToNext = () => {
    const nextIndex = Math.min(currentSectionIndex.value + 1, sections.length - 1)
    scrollToSection(sections[nextIndex].id)
  }
  
  const scrollToPrevious = () => {
    const prevIndex = Math.max(currentSectionIndex.value - 1, 0)
    scrollToSection(sections[prevIndex].id)
  }
  
  // IntersectionObserver for section visibility tracking
  let intersectionObserver: IntersectionObserver | null = null
  
  const setupVisibilityObserver = () => {
    const sectionElements = document.querySelectorAll('[data-section]')
    
    if (sectionElements.length === 0) return
    
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section')
          if (sectionId) {
            // Section is visible if more than 10% is in viewport
            sectionVisibility.value.set(sectionId, entry.intersectionRatio >= 0.1)
          }
        })
      },
      {
        threshold: [0, 0.1, 0.5, 1.0], // Multiple thresholds for better tracking
        rootMargin: '50px' // Start tracking slightly before fully visible
      }
    )
    
    sectionElements.forEach((el) => {
      intersectionObserver?.observe(el)
      // Initialize visibility state
      const sectionId = el.getAttribute('data-section')
      if (sectionId) {
        sectionVisibility.value.set(sectionId, false)
      }
    })
  }
  
  const isSectionVisible = (sectionId: string): boolean => {
    return sectionVisibility.value.get(sectionId) ?? false
  }
  
  // Register scroll listener when component mounts
  // Use a simpler approach that always works
  const instance = getCurrentInstance()
  if (instance) {
    onMounted(() => {
      registerScrollListener()
      
      // Setup visibility observer after a short delay to ensure DOM is ready
      setTimeout(() => {
        setupVisibilityObserver()
      }, 100)
    })
    
    onUnmounted(() => {
      if (scrollListenerCleanup) {
        scrollListenerCleanup()
        scrollListenerCleanup = null
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect()
        intersectionObserver = null
      }
    })
  } else {
    // Fallback: register immediately if not in component context
    // This ensures it works even if called outside a component
    if (typeof window !== 'undefined') {
      registerScrollListener()
    }
  }
  
  return {
    sections,
    currentSection,
    currentSectionIndex,
    totalSections,
    scrollProgress,
    progressPercent,
    visitedSections,
    sectionVisibility,
    scrollToSection,
    scrollToNext,
    scrollToPrevious,
    markSectionVisited,
    isSectionVisible
  }
}

