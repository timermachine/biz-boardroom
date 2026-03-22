/* eslint-env node */

import http from 'node:http'
import { test } from 'node:test'
import assert from 'node:assert'
import { app } from '../src/app.js'

const port = 4000
let server

async function request(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path, timeout: 3000 }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }))
    }).on('error', reject)
  })
}

test('setup server', async (t) => {
  server = app.listen(port)
  t.after(() => { server.close() })

  const health = await request('/health')
  assert.strictEqual(health.statusCode, 200)
  assert.strictEqual(health.body.status, 'ok')
})

test('root route responds with welcome message', async () => {
  const message = await request('/')
  assert.strictEqual(message.statusCode, 200)
  assert.strictEqual(message.body.message, 'Hello from myapp')
})

test('hello-new-world route returns correct message', async () => {
  const res = await request('/hello-new-world')
  assert.strictEqual(res.statusCode, 200)
  assert.strictEqual(res.body.message, 'Hello new world')
})

test('db-health responds appropriately based on DATABASE_URL', async () => {
  const db = await request('/db-health')
  if (!globalThis.process?.env?.DATABASE_URL) {
    assert.strictEqual(db.statusCode, 503)
    assert.strictEqual(db.body.status, 'unavailable')
  } else {
    assert.strictEqual(db.statusCode, 200)
    assert.strictEqual(db.body.status, 'ok')
    assert.strictEqual(db.body.db, 'connected')
  }
})
