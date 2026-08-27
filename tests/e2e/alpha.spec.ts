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

  // Settled answers grow their action row (copy / retry / thumbs)
  await expect(page.getByRole('button', { name: /copier|copy/i }).first()).toBeVisible({ timeout: 20_000 })

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
        'data: {"type":"text","delta":"Réponse **générée** par le modèle de test.\\n[suggest: Question un ? | Question deux ?]"}',
        'data: {"type":"done"}'
      ].join('\n\n') + '\n\n'
    }))

  await page.goto('/?ui=alpha')

  // Wait for the scripted welcome to finish (suggestions appear), then ask
  await expect(page.locator('button', { hasText: /exp[ée]rience/i }).first()).toBeVisible({ timeout: 15_000 })
  await page.locator('textarea').fill('dis-moi tout')
  await page.keyboard.press('Enter')

  // The mocked SSE stream drives the UI: tool call, streamed text, card
  await expect(page.getByText('resume.getSkills', { exact: false })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Réponse générée par le modèle de test.')).toBeVisible({ timeout: 15_000 })
  // Markdown is rendered, not shown raw: **générée** becomes a <strong>
  await expect(page.locator('.alpha-app strong', { hasText: 'générée' })).toBeVisible()
  await expect(page.getByText('System Design').first()).toBeVisible({ timeout: 15_000 })

  // The [suggest:] directive becomes follow-up chips and never shows as text
  await expect(page.locator('button', { hasText: 'Question un ?' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('[suggest', { exact: false })).toHaveCount(0)

  expect(errors).toEqual([])
})

test('the chat is the default and the classic 3D version links back to it', async ({ page }) => {
  // Default experience: the conversational resume
  await page.goto('/')
  await expect(page.locator('.alpha-app')).toBeVisible({ timeout: 15_000 })

  // The classic site (reached by URL) links back to the chat
  await page.goto('/?ui=classic')
  await expect(page.locator('[data-section="hero"]')).toBeAttached({ timeout: 15_000 })
  const chatPill = page.locator('a[href="/"]')
  await expect(chatPill).toBeVisible()
  await chatPill.click()
  await expect(page.locator('.alpha-app')).toBeVisible({ timeout: 15_000 })
})

test('legacy section links still open the classic 3D site', async ({ page }) => {
  await page.goto('/#maker')
  await expect(page.locator('[data-section="maker"]')).toBeAttached({ timeout: 15_000 })
})

test('the conversation survives a reload and a new conversation clears it', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('button', { hasText: /exp[ée]rience/i }).first()).toBeVisible({ timeout: 15_000 })
  await page.locator('textarea').fill('homelab?')
  await page.keyboard.press('Enter')
  await expect(page.getByText('resume.getHomelab', { exact: false })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: /retry|r[ée]essayer/i })).toBeVisible({ timeout: 20_000 })

  // Reload: the thread is restored from localStorage
  await page.reload()
  await expect(page.getByText('resume.getHomelab', { exact: false })).toBeVisible({ timeout: 15_000 })

  // New conversation wipes it and replays the welcome
  await page.getByRole('button', { name: /nouvelle conversation|new conversation/i }).click()
  await expect(page.getByText('resume.getHomelab', { exact: false })).toHaveCount(0)
  await expect(page.getByText('Damien Battistella').first()).toBeVisible({ timeout: 15_000 })
})
