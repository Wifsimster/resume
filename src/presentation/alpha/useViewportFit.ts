import { useEffect } from 'react'

// Mobile viewport plumbing for the full-height chat shell.
//
// Two problems the CSS viewport units cannot solve on their own:
//  - the app is `position: fixed; inset: 0`, so its bottom edge lands under
//    the browser's own navigation toolbar — the composer and the native
//    chrome end up docked on top of each other;
//  - opening the virtual keyboard shrinks the *visual* viewport only, so a
//    fixed composer stays behind the keyboard instead of riding above it.
//
// The visualViewport API gives both numbers. They are published as custom
// properties on <html> and consumed by alpha.css: the shell lifts its bottom
// edge above the keyboard, and the composer keeps its safe-area breathing
// room while the keyboard is closed.

const KEYBOARD_THRESHOLD_PX = 120

export function useViewportFit() {
  useEffect(() => {
    const viewport = window.visualViewport
    const root = document.documentElement

    const apply = () => {
      // What the keyboard (or any other overlay) hides at the bottom of the
      // layout viewport. Rounded down: sub-pixel noise would jitter the shell.
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
