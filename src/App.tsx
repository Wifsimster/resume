import { useEffect, useRef } from 'react'
import HomeView from '@presentation/views/HomeView'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher'
import AchievementToast from '@presentation/components/ui/AchievementToast'
import AchievementsIndicator from '@presentation/components/ui/AchievementsIndicator'
import FPSDisplay from '@presentation/components/ui/FPSDisplay'
import type { FPSDisplayHandle } from '@presentation/components/ui/FPSDisplay'
import TableOfContents from '@presentation/components/ui/TableOfContents'
import CompanionOverlay from '@presentation/components/ui/CompanionOverlay'
import AppBackground from '@presentation/components/ui/AppBackground'
import { useAchievements } from '@application/hooks/useAchievements'
import { useEasterEggs } from '@application/hooks/useEasterEggs'
import { startFPSMonitoring } from '@application/hooks/useQuality'
import { useAchievementsStore } from '@application/stores/achievements'

const VISIT_STORAGE_KEY = 'wifsimster_visit_count'
const VISIT_DAYS_STORAGE_KEY = 'wifsimster_visit_days'

export default function App() {
  const { currentAchievement, showAchievement, dismissAchievement } = useAchievements()

  // Initialize easter eggs listener
  const { fpsEnabled } = useEasterEggs()

  // FPS display ref
  const fpsDisplayRef = useRef<FPSDisplayHandle>(null)

  // Watch for FPS enable/disable
  useEffect(() => {
    if (!fpsDisplayRef.current) return
    if (fpsEnabled) {
      fpsDisplayRef.current.start()
    } else {
      fpsDisplayRef.current.stop()
    }
  }, [fpsEnabled])

  // Hash navigation: scroll to the section targeted by #hash — on load and on
  // every hash change. The site has a single page, so no router is involved.
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash
      if (!hash) return
      const element = document.querySelector(hash)
        ?? document.querySelector(`[data-section="${hash.slice(1)}"]`)
      element?.scrollIntoView({ behavior: 'smooth' })
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  useEffect(() => {
    const { unlock, isUnlocked } = useAchievementsStore.getState()

    // Guard the FPS target: the monitor auto-degrades quality (high → low →
    // minimal) whenever sustained FPS falls below 70% of the target, so the
    // higher desktop DPR/texture budget can never lock the page under 60fps.
    startFPSMonitoring()

    // Auto-enable FPS display in development
    if (import.meta.env.DEV && fpsDisplayRef.current) {
      fpsDisplayRef.current.start()
    }

    // Check visit-related achievements
    const visitCount = parseInt(localStorage.getItem(VISIT_STORAGE_KEY) || '0', 10)
    if (visitCount === 0) {
      unlock('firstVisit')
    } else {
      unlock('returnVisitor')
    }
    localStorage.setItem(VISIT_STORAGE_KEY, String(visitCount + 1))

    // Check time-based achievements
    const hour = new Date().getHours()
    const day = new Date().getDay()

    // Early bird: 5AM - 8AM
    if (hour >= 5 && hour < 8) {
      unlock('earlyBird')
    }

    // Night owl: 10PM - 5AM
    if (hour >= 22 || hour < 5) {
      unlock('nightOwl')
    }

    // Night explorer: midnight - 3AM
    if (hour >= 0 && hour < 4) {
      unlock('nightExplorer')
    }

    // Weekend warrior: Saturday (6) or Sunday (0)
    if (day === 0 || day === 6) {
      unlock('weekendWarrior')
    }

    // Check 3D load completion for patience achievement: unlock after page
    // fully loads (including 3D)
    const handleLoad = () => {
      setTimeout(() => {
        unlock('patience')
      }, 3000) // Wait 3 seconds after full load
    }
    window.addEventListener('load', handleLoad, { once: true })

    // Check device type
    if (navigator.maxTouchPoints > 0 && window.innerWidth < 768) {
      unlock('mobileScout')
    }

    // Track unique visit days for frequent flyer
    const today = new Date().toISOString().split('T')[0]
    const savedDays = JSON.parse(localStorage.getItem(VISIT_DAYS_STORAGE_KEY) || '[]') as string[]
    if (!savedDays.includes(today)) {
      savedDays.push(today)
      localStorage.setItem(VISIT_DAYS_STORAGE_KEY, JSON.stringify(savedDays))
    }
    if (savedDays.length >= 3) {
      unlock('frequentFlyer')
    }

    // Listen for print attempts
    const handleBeforePrint = () => {
      unlock('printReady')
    }
    window.addEventListener('beforeprint', handleBeforePrint)

    // Track time spent
    const startTime = Date.now()
    const timeSpentInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 / 60 // minutes
      if (elapsed >= 5 && !isUnlocked('timeSpent')) {
        unlock('timeSpent')
      }
      if (elapsed >= 10 && !isUnlocked('devotedReader')) {
        unlock('devotedReader')
      }
      if (isUnlocked('timeSpent') && isUnlocked('devotedReader')) {
        clearInterval(timeSpentInterval)
      }
    }, 10000) // Check every 10 seconds

    // Track clicks
    let clickCount = 0
    const handleClick = () => {
      clickCount++
      if (clickCount >= 50 && !isUnlocked('clickHappy')) {
        unlock('clickHappy')
      }
    }

    // Track scroll distance
    let totalScrolled = 0
    let lastScrollY = window.scrollY
    let reachedBottom = false
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDiff = Math.abs(currentScrollY - lastScrollY)
      totalScrolled += scrollDiff
      lastScrollY = currentScrollY

      if (totalScrolled >= 10000 && !isUnlocked('scrollMaster')) {
        unlock('scrollMaster')
      }

      // Boomerang: scrolled to bottom then back to top
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollPercent = currentScrollY / (scrollHeight - clientHeight)

      if (scrollPercent >= 0.99) {
        reachedBottom = true
      }
      if (reachedBottom && scrollPercent < 0.01 && !isUnlocked('boomerang')) {
        unlock('boomerang')
      }
    }

    // Track Tab key presses
    let tabKeyCount = 0
    const handleKeyboardTracking = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabKeyCount++
        if (tabKeyCount >= 10 && !isUnlocked('keyboardNinja')) {
          unlock('keyboardNinja')
        }
      }
    }

    // Buffer keystrokes and detect secret words
    let secretBuffer = ''
    const handleSecretWord = (e: KeyboardEvent) => {
      if (e.key.length === 1) {
        secretBuffer += e.key.toLowerCase()
        // Keep buffer manageable
        if (secretBuffer.length > 20) {
          secretBuffer = secretBuffer.slice(-20)
        }
        if (secretBuffer.includes('hello') || secretBuffer.includes('bonjour')) {
          unlock('secretWhisper')
          secretBuffer = ''
        }
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyboardTracking)
    window.addEventListener('keydown', handleSecretWord)

    return () => {
      window.removeEventListener('load', handleLoad)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyboardTracking)
      window.removeEventListener('keydown', handleSecretWord)
      window.removeEventListener('beforeprint', handleBeforePrint)
      clearInterval(timeSpentInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-(--color-bg-primary)">
      {/* Modern aurora-mesh backdrop behind everything */}
      <AppBackground />

      {/* Fixed UI Elements */}
      <header className="fixed top-4 right-4 z-100 flex gap-3 items-center sm:top-2 sm:right-2 sm:gap-2">
        <AchievementsIndicator />
        <LanguageSwitcher />
      </header>

      {/* Table of Contents (Desktop only) */}
      <TableOfContents />

      {/* Main Content */}
      <HomeView />

      {/* Three.js space companion cruising across every section */}
      <CompanionOverlay />

      {/* Achievement Toast */}
      {showAchievement && currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onClose={dismissAchievement}
        />
      )}

      {/* FPS Display */}
      <FPSDisplay ref={fpsDisplayRef} />
    </div>
  )
}
