import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url))
    }
  },
  ssr: {
    noExternal: true
  },
  build: {
    ssr: 'server/index.ts',
    outDir: 'dist-server',
    target: 'node24',
    emptyOutDir: true
  }
})
