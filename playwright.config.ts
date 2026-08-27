import { defineConfig } from '@playwright/test'

// CHROMIUM_PATH lets sandboxed environments point at a system Chromium
// (with software-GL flags) instead of the Playwright-managed download.
const executablePath = process.env.CHROMIUM_PATH

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1440, height: 900 },
    launchOptions: executablePath
      ? { executablePath, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }
      : {}
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI
  }
})
