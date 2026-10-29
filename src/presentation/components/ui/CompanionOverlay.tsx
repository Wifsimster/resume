import { Suspense, lazy, useEffect, useState } from 'react'
import './CompanionOverlay.css'

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
