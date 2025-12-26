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
  
  onMounted(() => {
    startTime.value = Date.now()
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
  
  return {
    sections,
    currentSection,
    currentSectionIndex,
    totalSections,
    scrollProgress,
    progressPercent,
    visitedSections,
    scrollToSection,
    scrollToNext,
    scrollToPrevious,
    markSectionVisited
  }
}

