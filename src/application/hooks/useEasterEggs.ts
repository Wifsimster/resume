import { useEffect } from 'react'
import { create } from 'zustand'
import { i18n } from '@application/i18n'
import { useAchievementsStore } from '@application/stores/achievements'

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

// Mobile Konami Code: Swipe Up, Up, Down, Down, Left, Right, Left, Right, Tap, Tap
const MOBILE_KONAMI_CODE = ['swipeUp', 'swipeUp', 'swipeDown', 'swipeDown', 'swipeLeft', 'swipeRight', 'swipeLeft', 'swipeRight', 'tap', 'tap']

// Secret color themes
export type SecretTheme = 'default' | 'matrix' | 'retro' | 'cyberpunk'

interface EasterEggsState {
  currentTheme: SecretTheme
  konamiActivated: boolean
  fpsEnabled: boolean
  setTheme: (theme: SecretTheme) => void
  activateKonamiCode: () => void
}

const createMatrixEffect = () => {
  const canvas = document.createElement('canvas')
  canvas.id = 'matrix-rain'
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.1;
  `
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'
  const fontSize = 14
  const columns = canvas.width / fontSize
  const drops: number[] = Array(Math.floor(columns)).fill(1)

  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#00FF41'
    ctx.font = `${fontSize}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(text, i * fontSize, drops[i] * fontSize)

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
  }

  const interval = setInterval(draw, 50)

  // Remove after 10 seconds
  setTimeout(() => {
    clearInterval(interval)
    canvas.remove()
    document.documentElement.classList.remove('theme-matrix')
  }, 10000)
}

export const useEasterEggsStore = create<EasterEggsState>((set, get) => ({
  currentTheme: 'default',
  konamiActivated: false,
  fpsEnabled: false,

  setTheme: (theme) => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-matrix', 'theme-retro', 'theme-cyberpunk')

    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`)
    }

    set({ currentTheme: theme })
  },

  activateKonamiCode: () => {
    if (get().konamiActivated) return
    set({ konamiActivated: true, currentTheme: 'matrix', fpsEnabled: true })
    useAchievementsStore.getState().unlock('codeHunter')

    // Apply matrix theme
    document.documentElement.classList.add('theme-matrix')

    // Create matrix rain effect
    createMatrixEffect()

    console.log('🎮 Konami Code activated! Welcome, gamer.')
  }
}))

const setupConsoleEasterEgg = () => {
  const t = (key: string) => i18n.t(key)

  // Add a welcome message to console
  const styles = [
    'color: #00FF41',
    'font-size: 16px',
    'font-weight: bold',
    'font-family: monospace'
  ].join(';')

  console.log(`%c👋 ${t('console.welcome')}`, styles)
  console.log(`%c${t('console.found')}`, 'color: #00FF41; font-family: monospace')
  console.log(`%c${t('console.hint')}`, 'color: #888; font-family: monospace; font-style: italic')

  // Add a global function that can be called from console
  ;(window as unknown as { resume?: () => void }).resume = () => {
    const { unlock, isUnlocked } = useAchievementsStore.getState()
    if (!isUnlocked('consoleExplorer')) {
      unlock('consoleExplorer')
    }

    console.log(`%c🎮 ${t('console.success')}`, 'color: #00FF41; font-size: 14px; font-weight: bold; font-family: monospace')
    console.log(`%c💡 ${t('console.tip')}`, 'color: #888; font-family: monospace')
    console.log(`%c${t('console.konamiCode')}`, 'color: #00FF41; font-family: monospace; font-size: 12px')

    // Add some fun ASCII art
    const title = t('console.asciiTitle')
    const subtitle = t('console.asciiSubtitle')
    console.log(`
%c
╔═══════════════════════════════════╗
║                                   ║
║   🚀 ${title.padEnd(33)}║
║                                   ║
║   ${subtitle.padEnd(33)}║
║                                   ║
╚═══════════════════════════════════╝
    `, 'color: #00FF41; font-family: monospace')
  }
}

// Installs the global listeners (Konami code, touch gestures, console easter
// egg). Call once at the app root; returns the reactive easter-egg state.
export function useEasterEggs() {
  const currentTheme = useEasterEggsStore(s => s.currentTheme)
  const konamiActivated = useEasterEggsStore(s => s.konamiActivated)
  const fpsEnabled = useEasterEggsStore(s => s.fpsEnabled)
  const setTheme = useEasterEggsStore(s => s.setTheme)

  useEffect(() => {
    const keySequence: string[] = []
    const touchSequence: string[] = []

    // Touch gesture tracking
    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0
    let touchSequenceTimeout: ReturnType<typeof setTimeout> | null = null
    const SWIPE_THRESHOLD = 50 // Minimum distance for a swipe
    const TAP_MAX_DURATION = 300 // Maximum duration for a tap (ms)
    const SEQUENCE_TIMEOUT = 2000 // Reset sequence after 2 seconds of inactivity

    const handleKeyDown = (event: KeyboardEvent) => {
      keySequence.push(event.code)

      // Keep only last N keys (N = KONAMI_CODE length)
      if (keySequence.length > KONAMI_CODE.length) {
        keySequence.shift()
      }

      // Check if sequence matches Konami code
      if (keySequence.length === KONAMI_CODE.length) {
        const matches = keySequence.every((key, index) => key === KONAMI_CODE[index])
        if (matches) {
          useEasterEggsStore.getState().activateKonamiCode()
        }
      }
    }

    const resetTouchSequence = () => {
      touchSequence.length = 0
      if (touchSequenceTimeout) {
        clearTimeout(touchSequenceTimeout)
        touchSequenceTimeout = null
      }
    }

    const checkMobileKonamiCode = () => {
      // Reset timeout
      if (touchSequenceTimeout) {
        clearTimeout(touchSequenceTimeout)
      }
      touchSequenceTimeout = setTimeout(resetTouchSequence, SEQUENCE_TIMEOUT)

      // Keep only last N gestures (N = MOBILE_KONAMI_CODE length)
      if (touchSequence.length > MOBILE_KONAMI_CODE.length) {
        touchSequence.shift()
      }

      // Check if sequence matches mobile Konami code
      if (touchSequence.length === MOBILE_KONAMI_CODE.length) {
        const matches = touchSequence.every((gesture, index) => gesture === MOBILE_KONAMI_CODE[index])
        if (matches) {
          resetTouchSequence()
          useEasterEggsStore.getState().activateKonamiCode()
        }
      }
    }

    const detectSwipeDirection = (startX: number, startY: number, endX: number, endY: number): string | null => {
      const deltaX = endX - startX
      const deltaY = endY - startY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Check if movement is significant enough to be a swipe
      if (absDeltaX < SWIPE_THRESHOLD && absDeltaY < SWIPE_THRESHOLD) {
        return null // Too small to be a swipe
      }

      // Determine primary direction
      if (absDeltaY > absDeltaX) {
        // Vertical swipe
        return deltaY < 0 ? 'swipeUp' : 'swipeDown'
      } else {
        // Horizontal swipe
        return deltaX < 0 ? 'swipeLeft' : 'swipeRight'
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0]
        touchStartX = touch.clientX
        touchStartY = touch.clientY
        touchStartTime = Date.now()
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length === 1 && touchStartTime > 0) {
        const touch = event.changedTouches[0]
        const endX = touch.clientX
        const endY = touch.clientY
        const duration = Date.now() - touchStartTime

        const swipeDirection = detectSwipeDirection(touchStartX, touchStartY, endX, endY)

        if (swipeDirection) {
          // It's a swipe
          touchSequence.push(swipeDirection)
          checkMobileKonamiCode()
        } else if (duration < TAP_MAX_DURATION) {
          // It's a tap (short duration, small movement)
          touchSequence.push('tap')
          checkMobileKonamiCode()
        }

        // Reset touch tracking
        touchStartTime = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Mobile touch events
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    setupConsoleEasterEgg()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)

      // Clean up timeouts
      if (touchSequenceTimeout) {
        clearTimeout(touchSequenceTimeout)
      }

      // Clean up the global function
      delete (window as unknown as { resume?: () => void }).resume
    }
  }, [])

  return {
    currentTheme,
    konamiActivated,
    fpsEnabled,
    setTheme
  }
}
