import { useEffect } from 'react'
import { create } from 'zustand'
import { useAchievementsStore } from '@application/stores/achievements'

export interface Section {
  id: string
  name: string
  visited: boolean
}

const initialSections: Section[] = [
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

interface ScrollSectionState {
  sections: Section[]
  currentSectionIndex: number
  scrollProgress: number
  visitedSections: Set<string>
  sectionVisibility: Map<string, boolean>
}

const useScrollSectionStore = create<ScrollSectionState>(() => ({
  sections: initialSections,
  currentSectionIndex: 0,
  scrollProgress: 0,
  visitedSections: new Set(['hero']),
  sectionVisibility: new Map()
}))

// Singleton pattern to ensure scroll listener is only registered once,
// ref-counted across the components that use this hook.
let scrollListenerRefCount = 0
let startTime: number | null = null

// Cached section elements — the section list is static after mount, so the
// scroll handler never needs to re-query the DOM.
let cachedSectionElements: HTMLElement[] = []

const getSectionElements = (): HTMLElement[] => {
  if (cachedSectionElements.length === 0) {
    cachedSectionElements = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
  }
  return cachedSectionElements
}

const markSectionVisited = (sectionId: string) => {
  const state = useScrollSectionStore.getState()
  if (state.visitedSections.has(sectionId)) return

  const visitedSections = new Set(state.visitedSections)
  visitedSections.add(sectionId)
  const sections = state.sections.map(s => (s.id === sectionId ? { ...s, visited: true } : s))
  useScrollSectionStore.setState({ visitedSections, sections })

  // Check if all sections visited
  if (visitedSections.size === sections.length) {
    useAchievementsStore.getState().unlock('explorer')
  }
}

const updateScrollState = () => {
  // Calculate overall scroll progress
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollProgress = (scrollTop / docHeight) * 100
  useScrollSectionStore.setState({ scrollProgress })

  // Determine current section based on scroll position
  const sectionElements = getSectionElements()
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
    let closest: { index: number; distance: number } | null = null
    sectionElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      const sectionCenter = rect.top + rect.height / 2
      const distance = Math.abs(viewportMiddle - sectionCenter)

      if (!closest || distance < closest.distance) {
        closest = { index, distance }
      }
    })
    if (closest) {
      bestMatch = closest
    }
  }

  if (bestMatch !== null) {
    const match = bestMatch as { index: number; distance: number }
    if (useScrollSectionStore.getState().currentSectionIndex !== match.index) {
      useScrollSectionStore.setState({ currentSectionIndex: match.index })
      const sectionId = sectionElements[match.index].getAttribute('data-section')
      if (sectionId) {
        markSectionVisited(sectionId)
      }
    }
  }

  // Check for speed runner achievement
  if (startTime && scrollProgress >= 99) {
    const elapsed = (Date.now() - startTime) / 1000
    if (elapsed < 30) {
      useAchievementsStore.getState().unlock('speedRunner')
    }
  }
}

// Coalesce scroll events into at most one state update per animation frame,
// so the handler's layout reads never run more than once per rendered frame.
let scrollRafId: number | null = null
const handleScroll = () => {
  if (scrollRafId !== null) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null
    updateScrollState()
  })
}

const acquireScrollListener = () => {
  scrollListenerRefCount++
  if (scrollListenerRefCount > 1) return

  startTime = Date.now()
  window.addEventListener('scroll', handleScroll, { passive: true })
  updateScrollState() // Initial check
}

const releaseScrollListener = () => {
  scrollListenerRefCount--
  if (scrollListenerRefCount > 0) return

  window.removeEventListener('scroll', handleScroll)
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId)
    scrollRafId = null
  }
  cachedSectionElements = []
}

// IntersectionObserver for section visibility tracking — shared singleton,
// ref-counted alongside the scroll listener.
let intersectionObserver: IntersectionObserver | null = null

const setupVisibilityObserver = () => {
  if (intersectionObserver) return
  const sectionElements = document.querySelectorAll('[data-section]')

  if (sectionElements.length === 0) return

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const sectionVisibility = new Map(useScrollSectionStore.getState().sectionVisibility)
      entries.forEach((entry) => {
        const sectionId = entry.target.getAttribute('data-section')
        if (sectionId) {
          // Section is visible if more than 10% is in viewport
          sectionVisibility.set(sectionId, entry.intersectionRatio >= 0.1)
        }
      })
      useScrollSectionStore.setState({ sectionVisibility })
    },
    {
      threshold: [0, 0.1, 0.5, 1.0], // Multiple thresholds for better tracking
      rootMargin: '50px' // Start tracking slightly before fully visible
    }
  )

  const sectionVisibility = new Map(useScrollSectionStore.getState().sectionVisibility)
  sectionElements.forEach((el) => {
    intersectionObserver?.observe(el)
    // Initialize visibility state
    const sectionId = el.getAttribute('data-section')
    if (sectionId) {
      sectionVisibility.set(sectionId, false)
    }
  })
  useScrollSectionStore.setState({ sectionVisibility })
}

const scrollToSection = (sectionId: string) => {
  const element = document.querySelector(`[data-section="${sectionId}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export function useScrollSection() {
  const sections = useScrollSectionStore(s => s.sections)
  const currentSectionIndex = useScrollSectionStore(s => s.currentSectionIndex)
  const scrollProgress = useScrollSectionStore(s => s.scrollProgress)
  const visitedSections = useScrollSectionStore(s => s.visitedSections)
  const sectionVisibility = useScrollSectionStore(s => s.sectionVisibility)

  useEffect(() => {
    acquireScrollListener()

    // Setup visibility observer after a short delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      setupVisibilityObserver()
    }, 100)

    return () => {
      clearTimeout(timeout)
      releaseScrollListener()
      if (scrollListenerRefCount === 0 && intersectionObserver) {
        intersectionObserver.disconnect()
        intersectionObserver = null
      }
    }
  }, [])

  const currentSection = sections[currentSectionIndex]
  const totalSections = sections.length
  const progressPercent = ((currentSectionIndex + 1) / totalSections) * 100

  const scrollToNext = () => {
    const nextIndex = Math.min(useScrollSectionStore.getState().currentSectionIndex + 1, sections.length - 1)
    scrollToSection(sections[nextIndex].id)
  }

  const scrollToPrevious = () => {
    const prevIndex = Math.max(useScrollSectionStore.getState().currentSectionIndex - 1, 0)
    scrollToSection(sections[prevIndex].id)
  }

  const isSectionVisible = (sectionId: string): boolean => {
    return sectionVisibility.get(sectionId) ?? false
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
