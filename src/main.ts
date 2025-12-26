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
      return { el: to.hash, behavior: 'smooth' }
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

