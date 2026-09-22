import { expect, test, type Page } from '@playwright/test'

const AWAY_MESSAGE = 'Send Message: Away Message. Press enter to open details.'
const COMMENT = 'Add Comment: Add Comment #1. Press enter to open details.'

function card(page: Page, label: string) {
  return page.getByRole('button', { name: label })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(card(page, 'Trigger: Trigger. Press enter to open details.')).toBeVisible()
})

test('renders the flow from the payload', async ({ page }) => {
  await expect(page.getByText('Business Hours – UTC')).toBeVisible()
  await expect(page.getByText('Success', { exact: true })).toBeVisible()
  await expect(page.getByText('Failure', { exact: true })).toBeVisible()
  await expect(card(page, AWAY_MESSAGE)).toBeVisible()
})

test('opens a node in the drawer and closes it again', async ({ page }) => {
  await card(page, AWAY_MESSAGE).click()

  const drawer = page.getByRole('dialog')
  await expect(drawer).toContainText('Away Message')
  await expect(drawer).toContainText('Sends texts and attachments to the contact.')

  await page.getByRole('button', { name: 'Close details' }).click()
  await expect(drawer).toHaveCount(0)
})

test('keeps an edit after a reload', async ({ page }) => {
  await card(page, COMMENT).click()

  const title = page.getByRole('dialog').getByLabel('Title')
  await title.fill('Renamed comment')
  await page.getByRole('button', { name: 'Save changes' }).click()

  const renamed = card(page, 'Add Comment: Renamed comment. Press enter to open details.')
  await expect(renamed).toBeVisible()

  await page.reload()
  await expect(renamed).toBeVisible()
})
