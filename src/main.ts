import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from '@application/i18n'
import App from './App.vue'
import './presentation/styles/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@presentation/views/HomeView.vue')
    }
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      // Try to find element by id first
      const element = document.querySelector(to.hash)
      if (element) {
        return { el: element, behavior: 'smooth' }
      }
      // Fallback: try to find by data-section
      const sectionElement = document.querySelector(`[data-section="${to.hash.slice(1)}"]`)
      if (sectionElement) {
        return { el: sectionElement, behavior: 'smooth' }
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

const app = createApp(App)

app.use(i18n)
app.use(router)

app.mount('#app')

