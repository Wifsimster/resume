import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// Build config of the chat backend (server/index.ts). SSR build so the server
// can import resumeData + locales through the same aliases as the frontend;
// noExternal bundles the AI SDK in, producing a self-contained dist-server/
// that runs on a bare node:24-alpine image without node_modules.

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
