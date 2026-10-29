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
import MobileScrollRail from '@presentation/components/ui/MobileScrollRail'
import { useAchievements } from '@application/hooks/useAchievements'
import { useEasterEggs } from '@application/hooks/useEasterEggs'
import { startFPSMonitoring } from '@application/hooks/useQuality'
import { useAchievementsStore } from '@application/stores/achievements'

const VISIT_STORAGE_KEY = 'wifsimster_visit_count'
const VISIT_DAYS_STORAGE_KEY = 'wifsimster_visit_days'

export default function App() {
  const { currentAchievement, showAchievement, dismissAchievement } = useAchievements()

  const { fpsEnabled } = useEasterEggs()

  const fpsDisplayRef = useRef<FPSDisplayHandle>(null)

  useEffect(() => {
    if (!fpsDisplayRef.current) return
    if (fpsEnabled) {
      fpsDisplayRef.current.start()
    } else {
      fpsDisplayRef.current.stop()
    }
  }, [fpsEnabled])

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

    startFPSMonitoring()

    if (import.meta.env.DEV && fpsDisplayRef.current) {
      fpsDisplayRef.current.start()
    }

    const visitCount = parseInt(localStorage.getItem(VISIT_STORAGE_KEY) || '0', 10)
    if (visitCount === 0) {
      unlock('firstVisit')
    } else {
      unlock('returnVisitor')
    }
    localStorage.setItem(VISIT_STORAGE_KEY, String(visitCount + 1))

    const hour = new Date().getHours()
    const day = new Date().getDay()

    if (hour >= 5 && hour < 8) {
      unlock('earlyBird')
    }

    if (hour >= 22 || hour < 5) {
      unlock('nightOwl')
    }

    if (hour >= 0 && hour < 4) {
      unlock('nightExplorer')
    }

    if (day === 0 || day === 6) {
      unlock('weekendWarrior')
    }

    const handleLoad = () => {
      setTimeout(() => {
        unlock('patience')
      }, 3000)
    }
    window.addEventListener('load', handleLoad, { once: true })

    if (navigator.maxTouchPoints > 0 && window.innerWidth < 768) {
      unlock('mobileScout')
    }

    const today = new Date().toISOString().split('T')[0]
    const savedDays = JSON.parse(localStorage.getItem(VISIT_DAYS_STORAGE_KEY) || '[]') as string[]
    if (!savedDays.includes(today)) {
      savedDays.push(today)
      localStorage.setItem(VISIT_DAYS_STORAGE_KEY, JSON.stringify(savedDays))
    }
    if (savedDays.length >= 3) {
      unlock('frequentFlyer')
    }

    const handleBeforePrint = () => {
      unlock('printReady')
    }
    window.addEventListener('beforeprint', handleBeforePrint)

    const startTime = Date.now()
    const timeSpentInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      if (elapsed >= 5 && !isUnlocked('timeSpent')) {
        unlock('timeSpent')
      }
      if (elapsed >= 10 && !isUnlocked('devotedReader')) {
        unlock('devotedReader')
      }
      if (isUnlocked('timeSpent') && isUnlocked('devotedReader')) {
        clearInterval(timeSpentInterval)
      }
    }, 10000)

    let clickCount = 0
    const handleClick = () => {
      clickCount++
      if (clickCount >= 50 && !isUnlocked('clickHappy')) {
        unlock('clickHappy')
      }
    }

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

    let tabKeyCount = 0
    const handleKeyboardTracking = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabKeyCount++
        if (tabKeyCount >= 10 && !isUnlocked('keyboardNinja')) {
          unlock('keyboardNinja')
        }
      }
    }

    let secretBuffer = ''
    const handleSecretWord = (e: KeyboardEvent) => {
      if (e.key.length === 1) {
        secretBuffer += e.key.toLowerCase()
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
      <AppBackground />

      <header className="fixed top-4 right-4 z-100 flex gap-3 items-center sm:top-2 sm:right-2 sm:gap-2">
        <a
          href="/"
          className="flex items-center gap-1.5 py-1.5 px-3 bg-[#1E1E1E]/80 backdrop-blur-md border border-[var(--color-accent-primary)]/40 rounded-lg no-underline text-xs font-(--font-code) text-[var(--color-paper-cream)] transition-all duration-150 hover:border-[var(--color-accent-primary)] hover:shadow-[0_0_15px_rgba(124,58,237,0.35)]"
          title="Conversational AI resume"
        >
          <span aria-hidden="true">💬</span> Chat IA
        </a>
        <AchievementsIndicator />
        <LanguageSwitcher />
      </header>

      <TableOfContents />

      <MobileScrollRail />

      <HomeView />

      <CompanionOverlay />

      {showAchievement && currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onClose={dismissAchievement}
        />
      )}

      <FPSDisplay ref={fpsDisplayRef} />
    </div>
  )
}
