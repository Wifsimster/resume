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

test('card items are interactive and ask about themselves', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('button', { hasText: /exp[ée]rience/i }).first()).toBeVisible({ timeout: 15_000 })
  await page.locator('textarea').fill('skills ?')
  await page.keyboard.press('Enter')
  await expect(page.getByText('resume.getSkills', { exact: false })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: /retry|r[ée]essayer/i })).toBeVisible({ timeout: 20_000 })

  // Clicking a skill chip in the card sends the matching question
  await page.locator('button', { hasText: 'System Design' }).first().click()
  await expect(page.locator('[data-role="user"]', { hasText: 'System Design' })).toBeVisible({ timeout: 15_000 })
})

test('the summary drawer gives a scannable resume without chatting', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.alpha-app')).toBeVisible({ timeout: 15_000 })

  // The way out of the conversation is in the header, labelled, and needs no
  // prompt: no message has been sent when it opens
  await page.getByRole('button', { name: /^(CV|Resume)$/ }).click()
  const panel = page.locator('[data-component="summary-panel"]')
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('heading', { name: 'Damien Battistella' })).toBeVisible()
  await expect(panel).toContainText('Tech Lead Manager')
  await expect(panel).toContainText('System Design')
  await expect(panel.locator('a[href*="linkedin.com"]')).toBeVisible()
  await expect(page.locator('[data-role="user"]')).toHaveCount(0)

  // Escape closes it and the thread is still there
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(page.locator('.alpha-app')).toBeVisible()
})

test('the language switch is labelled FR / EN, not flags', async ({ page }) => {
  await page.goto('/')
  const switcher = page.locator('[data-component="language-switcher"]')
  await expect(switcher).toContainText('FR')
  await expect(switcher).toContainText('EN')
  await expect(switcher.locator('svg')).toHaveCount(0)

  // It still switches the locale: the header title follows (the starting
  // locale comes from the browser, so assert the flip rather than a language)
  const title = page.locator('.alpha-app header span').first()
  const before = await title.textContent()
  await switcher.click()
  await expect(title).not.toHaveText(before ?? '')
  await switcher.click()
  await expect(title).toHaveText(before ?? '')
})

test('prompt chips collapse behind a toggle on a phone once the chat starts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  // Before the first question they are the on-ramp: always visible
  const firstChip = page.locator('.alpha-suggestions button').first()
  await expect(firstChip).toBeVisible({ timeout: 15_000 })

  await page.locator('textarea').fill('homelab?')
  await page.keyboard.press('Enter')
  await expect(page.getByText('resume.getHomelab', { exact: false })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: /retry|r[ée]essayer/i })).toBeVisible({ timeout: 20_000 })

  // Afterwards they fold away and stay one tap from the composer
  const toggle = page.getByRole('button', { name: /suggestions/i })
  await expect(toggle).toBeVisible()
  await expect(firstChip).toBeHidden()
  await toggle.click()
  await expect(page.locator('.alpha-suggestions button').first()).toBeVisible()
})
