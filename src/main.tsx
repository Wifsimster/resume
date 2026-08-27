import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@application/i18n'
import App from './App'
import './presentation/styles/main.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
