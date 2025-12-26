import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAchievements } from './useAchievements'

export interface Section {
  id: string
  name: string
  visited: boolean
}

const sections: Section[] = [
  { id: 'hero', name: 'Hero', visited: false },
  { id: 'about', name: 'About', visited: false },
  { id: 'experience', name: 'Experience', visited: false },
  { id: 'leadership', name: 'Leadership', visited: false },
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

export function useScrollSection() {
  const { unlock } = useAchievements()
  
  const currentSection = computed(() => sections[currentSectionIndex.value])
  const totalSections = computed(() => sections.length)
  
  const progressPercent = computed(() => {
    return ((currentSectionIndex.value + 1) / totalSections.value) * 100
  })
  
  const handleScroll = () => {
    // Calculate overall scroll progress
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
    
    // Determine current section based on scroll position
    const sectionElements = document.querySelectorAll('[data-section]')
    const viewportMiddle = scrollTop + window.innerHeight / 2
    
    sectionElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      const sectionTop = scrollTop + rect.top
      const sectionBottom = sectionTop + rect.height
      
      if (viewportMiddle >= sectionTop && viewportMiddle < sectionBottom) {
        currentSectionIndex.value = index
        const sectionId = el.getAttribute('data-section')
        if (sectionId) {
          markSectionVisited(sectionId)
        }
      }
    })
    
    // Check for speed runner achievement
    if (startTime.value && scrollProgress.value >= 99) {
      const elapsed = (Date.now() - startTime.value) / 1000
      if (elapsed < 30) {
        unlock('speedRunner')
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
      if (visitedSections.value.size === sections.length) {
        unlock('explorer')
      }
    }
  }
  
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
  
  onMounted(() => {
    startTime.value = Date.now()
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    
    // Setup visibility observer after a short delay to ensure DOM is ready
    setTimeout(() => {
      setupVisibilityObserver()
    }, 100)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
  })
  
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

