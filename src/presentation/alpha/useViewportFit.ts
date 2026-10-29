import { useEffect } from 'react'

const KEYBOARD_THRESHOLD_PX = 120

export function useViewportFit() {
  useEffect(() => {
    const viewport = window.visualViewport
    const root = document.documentElement

    const apply = () => {
      const hidden = viewport
        ? Math.max(0, Math.floor(window.innerHeight - viewport.height - viewport.offsetTop))
        : 0
      const keyboard = hidden > KEYBOARD_THRESHOLD_PX ? hidden : 0
      root.style.setProperty('--alpha-keyboard-inset', `${keyboard}px`)
      root.dataset.alphaKeyboard = keyboard > 0 ? 'open' : 'closed'
    }

    apply()
    viewport?.addEventListener('resize', apply)
    viewport?.addEventListener('scroll', apply)
    window.addEventListener('orientationchange', apply)

    return () => {
      viewport?.removeEventListener('resize', apply)
      viewport?.removeEventListener('scroll', apply)
      window.removeEventListener('orientationchange', apply)
      root.style.removeProperty('--alpha-keyboard-inset')
      delete root.dataset.alphaKeyboard
    }
  }, [])
}
