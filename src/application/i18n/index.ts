import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from '@/locales/fr'
import en from '@/locales/en'

const detectLanguage = (): 'fr' | 'en' => {
  const saved = localStorage.getItem('locale')
  if (saved === 'fr' || saved === 'en') return saved

  const browserLang = navigator.language.split('-')[0]
  return browserLang === 'en' ? 'en' : 'fr'
}

i18next.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en }
  },
  lng: detectLanguage(),
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false
  }
})

document.documentElement.lang = i18next.language

export const i18n = i18next

export const setLocale = (locale: 'fr' | 'en') => {
  i18next.changeLanguage(locale)
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export const toggleLocale = () => {
  const newLocale = i18next.language === 'fr' ? 'en' : 'fr'
  setLocale(newLocale)
  return newLocale
}
