import { test, expect } from '@playwright/test'

test('conversational alpha streams the welcome and answers a suggestion', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/?ui=alpha')

  // Welcome message streams in with the profile card
  await expect(page.locator('.alpha-app')).toBeVisible()
  await expect(page.getByText('Damien Battistella').first()).toBeVisible({ timeout: 15_000 })

  // Suggestions appear once the welcome finishes streaming
  const suggestion = page.locator('button', { hasText: /exp[ée]rience/i }).first()
  await expect(suggestion).toBeVisible({ timeout: 15_000 })
  await suggestion.click()

  // The answer runs a visible tool call and renders the experience card
  await expect(page.getByText('resume.getExperience', { exact: false })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/Tech Lead Manager/).first()).toBeVisible({ timeout: 15_000 })

  // Wait for streaming to finish (input rejects sends mid-stream): the
  // follow-up suggestions only render once the answer completes
  await expect(page.locator('button', { hasText: /skills|comp[ée]tences/i }).first()).toBeVisible({ timeout: 20_000 })

  // Free-typed question falls through the intent matcher
  await page.locator('textarea').fill('homelab?')
  await page.keyboard.press('Enter')
  await expect(page.getByText('resume.getHomelab', { exact: false })).toBeVisible({ timeout: 15_000 })

  expect(errors).toEqual([])
})

test('live mode streams the answer from the chat API when a provider is up', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.route('**/api/chat/health', route =>
    route.fulfill({ json: { ok: true, live: true, model: 'test-model' } }))
  await page.route('**/api/chat', route =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body: [
        'data: {"type":"card-intent","kind":"skills"}',
        'data: {"type":"text","delta":"Réponse générée par le modèle de test."}',
        'data: {"type":"done"}'
      ].join('\n\n') + '\n\n'
    }))

  await page.goto('/?ui=alpha')

  // The header switches to the live badge once health reports a provider
  await expect(page.getByText(/IA en direct|live AI/).first()).toBeVisible({ timeout: 15_000 })

  // Wait for the scripted welcome to finish (suggestions appear), then ask
  await expect(page.locator('button', { hasText: /exp[ée]rience/i }).first()).toBeVisible({ timeout: 15_000 })
  await page.locator('textarea').fill('dis-moi tout')
  await page.keyboard.press('Enter')

  // The mocked SSE stream drives the UI: tool call, streamed text, card
  await expect(page.getByText('resume.getSkills', { exact: false })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Réponse générée par le modèle de test.')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('System Design').first()).toBeVisible({ timeout: 15_000 })

  expect(errors).toEqual([])
})

test('classic site links to the alpha and the alpha links back', async ({ page }) => {
  await page.goto('/')
  const alphaPill = page.locator('a[href="?ui=alpha"]')
  await expect(alphaPill).toBeVisible()
  await alphaPill.click()
  await expect(page.locator('.alpha-app')).toBeVisible({ timeout: 15_000 })

  await page.locator('header button').first().click()
  await expect(page.locator('[data-section="hero"]')).toBeAttached({ timeout: 15_000 })
})
