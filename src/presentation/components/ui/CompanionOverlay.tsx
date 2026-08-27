import { Suspense, lazy, useEffect, useState } from 'react'
import './CompanionOverlay.css'

// Fixed, fully transparent Three.js overlay hosting the space companion.
// Always rendered: it is decoration the site's identity is built around, and
// the OS-level reduced-motion setting was silently hiding it on desktops.
// Interaction safety is handled in CSS (CompanionOverlay.css).

// Code-split AND idle-deferred: the companion is decoration, so its canvas
// only mounts once the browser has a quiet moment after startup.
const CompanionCanvas = lazy(() => import('@presentation/components/three/CompanionCanvas'))

export default function CompanionOverlay() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(() => setReady(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="companion-overlay fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
      {ready && (
        <Suspense fallback={null}>
          <CompanionCanvas />
        </Suspense>
      )}
    </div>
  )
}
