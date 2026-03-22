import { test, expect } from '@playwright/test'

test('/ response matches snapshot', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('root.png')
})

test('/health response matches snapshot', async ({ page }) => {
  await page.goto('/health')
  await expect(page).toHaveScreenshot('health.png')
})

test('/db-health response matches snapshot', async ({ page }) => {
  await page.goto('/db-health')
  await expect(page).toHaveScreenshot('db-health.png')
})
