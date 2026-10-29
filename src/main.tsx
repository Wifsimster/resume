import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@application/i18n'
import './presentation/styles/main.css'

const ChatApp = lazy(() => import('@presentation/alpha/AlphaApp'))
const ClassicApp = lazy(() => import('./App'))

const params = new URLSearchParams(window.location.search)
const SECTION_HASH = /^#(hero|about|experience|motivation|skills|maker|projects|books|contact)$/
const classic = params.get('ui') === 'classic'
  || (!params.has('ui') && SECTION_HASH.test(window.location.hash))

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {classic ? <ClassicApp /> : <ChatApp />}
    </Suspense>
  </StrictMode>
)
