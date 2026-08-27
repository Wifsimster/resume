import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const SECTIONS = ['hero', 'about', 'motivation', 'experience', 'skills', 'maker', 'projects', 'books', 'contact']

const collectPageErrors = (page: Page): string[] => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

test('renders all sections without runtime errors', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')

  for (const section of SECTIONS) {
    await expect(page.locator(`[data-section="${section}"]`)).toBeAttached()
  }

  // Hero + companion canvases are live at the top; the maker canvas is
  // lazy and only appears once its section approaches the viewport
  await expect.poll(async () => page.locator('canvas').count()).toBeGreaterThanOrEqual(2)

  await page.locator('[data-section="maker"]').scrollIntoViewIfNeeded()
  await expect.poll(async () => page.locator('canvas').count()).toBeGreaterThanOrEqual(3)

  expect(errors).toEqual([])
})

test('language switcher toggles between French and English', async ({ page }) => {
  await page.goto('/')
  const aboutTitle = page.locator('[data-section="about"] h2')
  const before = await aboutTitle.textContent()

  await page.locator('header button').last().click()
  await expect(aboutTitle).not.toHaveText(before ?? '')

  // Toggle back
  await page.locator('header button').last().click()
  await expect(aboutTitle).toHaveText(before ?? '')
})

test('maker section switches to rack mode and shows the legend', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')
  await page.locator('[data-section="maker"]').scrollIntoViewIfNeeded()

  // Wait for the lazily loaded maker canvas, then toggle the camera mode
  const toggle = page.locator('[data-section="maker"] button').first()
  await expect(toggle).toBeVisible()
  await toggle.click()

  // Legend labels appear once the camera lands on the rack
  await expect(page.locator('[data-section="maker"] svg line').first()).toBeAttached()

  expect(errors).toEqual([])
})

test('projects section lists the open-source projects', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-section="projects"]').scrollIntoViewIfNeeded()

  const cards = page.locator('[data-section="projects"] a')
  await expect.poll(async () => cards.count()).toBeGreaterThanOrEqual(8)
  await expect(page.locator('[data-section="projects"]')).toContainText('ondes')
})
