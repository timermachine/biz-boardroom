import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const bizDir = path.resolve(testDir, '..')
const minutesDir = path.join(bizDir, 'board-minutes')

test('loads protected members and shows structured member instructions', async ({ page, request }) => {
  const response = await request.get('/api/bootstrap')
  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  expect(Object.keys(data.builtinMembers)).toEqual(expect.arrayContaining(['edward', 'henry', 'chris', 'psy', 'archie', 'reaf']))

  await page.goto('/')

  await expect(page.locator('#memberList')).toContainText('Chris')
  await expect(page.locator('#memberList')).toContainText('Reaf')
  await expect(page.locator('#memberInspector')).toContainText('Functional Archetype')
  await expect(page.locator('#memberInspector')).toContainText('Primary Driver')
  await expect(page.locator('#memberInspector')).toContainText('Non-Negotiable')
})

test('custom members persist across reload and can be deleted', async ({ page }) => {
  await page.goto('/')

  await page.fill('#newMemberName', 'Mina')
  await page.fill('#newMemberTitle', 'CMO')
  await page.fill('#newMemberExpertise', 'Demand generation, market narrative, growth experiments')
  await page.fill('#newMemberPersonality', 'Coalition-building and commercially alert.')
  await page.click('#addMemberBtn')

  await expect(page.locator('#memberList')).toContainText('Mina')
  await page.reload()
  await expect(page.locator('#memberList')).toContainText('Mina')

  await page.locator('#memberList .member', { hasText: 'Mina' }).click()
  await expect(page.locator('#memberInspector')).toContainText('Delete Member')
  await page.click('#deleteMemberBtn')
  await expect(page.locator('#memberList')).not.toContainText('Mina')
})

test('moodometer defaults are applied per protected member', async ({ page }) => {
  await page.goto('/')

  await page.locator('#memberList .member', { hasText: 'Edward' }).click()
  await expect(page.locator('#memberInspector')).toContainText('Moodometer')
  await expect(page.locator('#memberInspector .mood-value')).toHaveText('1')

  await page.locator('#memberList .member', { hasText: 'Psy' }).click()
  await expect(page.locator('#memberInspector .mood-value')).toHaveText('5')
})

test('respond flow can be stubbed and minutes are written to board-minutes', async ({ page }) => {
  await page.route('**/api/respond', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: 'We have a blocker, but the next step is clear: assign an owner and proceed.' }),
    })
  })

  const beforeFiles = new Set(await fs.readdir(minutesDir))

  await page.goto('/')
  await page.fill('#userInput', 'Chris, break the impasse and tell us the next step.')
  await page.selectOption('#targetSelect', 'chris')
  await page.click('#sendBtn')

  await expect(page.locator('#messages')).toContainText('assign an owner and proceed')
  await expect(page.locator('#saveStatus')).toContainText('Saved to')

  const afterFiles = await fs.readdir(minutesDir)
  const newFiles = afterFiles.filter((file) => !beforeFiles.has(file))
  expect(newFiles.length).toBeGreaterThan(0)

  await Promise.all(newFiles.map((file) => fs.unlink(path.join(minutesDir, file))))
})
