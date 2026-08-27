import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@application/i18n'
import App from './App'
import './presentation/styles/main.css'

// Conversational alpha (?ui=alpha): its own lazy chunk replacing the whole
// classic tree — none of the classic listeners, canvases or achievements run
// under it, and the classic site pays nothing for the alpha's code.
const AlphaApp = lazy(() => import('@presentation/alpha/AlphaApp'))
const alpha = new URLSearchParams(window.location.search).get('ui') === 'alpha'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    {alpha ? (
      <Suspense fallback={null}>
        <AlphaApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
)
