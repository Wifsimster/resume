import { createI18n } from 'vue-i18n'
import fr from '@/locales/fr'
import en from '@/locales/en'

// Detect browser language
const detectLanguage = (): 'fr' | 'en' => {
  // Check localStorage first
  const saved = localStorage.getItem('locale')
  if (saved === 'fr' || saved === 'en') return saved
  
  // Detect from browser
  const browserLang = navigator.language.split('-')[0]
  return browserLang === 'en' ? 'en' : 'fr'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLanguage(),
  fallbackLocale: 'fr',
  messages: {
    fr,
    en
  }
})

export const setLocale = (locale: 'fr' | 'en') => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export const toggleLocale = () => {
  const newLocale = i18n.global.locale.value === 'fr' ? 'en' : 'fr'
  setLocale(newLocale)
  return newLocale
}

