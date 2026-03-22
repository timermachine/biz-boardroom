import { test, expect } from '@playwright/test'

test('GET / returns welcome message', async ({ request }) => {
  const res = await request.get('/')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.message).toBe('Hello from myapp')
})

test('GET /health returns ok', async ({ request }) => {
  const res = await request.get('/health')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.status).toBe('ok')
})

test('GET /hello-new-world returns correct message', async ({ request }) => {
  const res = await request.get('/hello-new-world')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.message).toBe('Hello new world')
})

test('GET /db-health returns 200 when db is up', async ({ request }) => {
  const res = await request.get('/db-health')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.status).toBe('ok')
  expect(body.db).toBe('connected')
})
