import { test, expect } from '@playwright/test'

test('displays the flow API response as JSON', async ({ page }) => {
  const responsePromise = page.waitForResponse('/api/flow')
  await page.goto('/')
  const response = await responsePromise
  expect(response.ok()).toBe(true)
  await expect(page.locator('h1')).toHaveText('Flow')
  await expect(page.locator('pre code')).toHaveText(JSON.stringify(await response.json(), null, 2))
})
