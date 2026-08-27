import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url))
    }
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) only accepts the function form
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/](three|@react-three)[\\/]/.test(id)) return 'three-vendor'
            return 'react-vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  },
  server: {
    // Local dev with the chat backend: `npm run build:server && npm run chat`
    proxy: {
      '/api': 'http://localhost:8787'
    }
  }
})
