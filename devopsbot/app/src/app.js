/* eslint-disable no-undef */
import express from 'express'
import pg from 'pg'

const app = express()
app.use(express.json())

const env = globalThis.process?.env || {}
const isDatabaseConfigured = Boolean(env.DATABASE_URL)
let pool

if (isDatabaseConfigured) {
  pool = new pg.Pool({ connectionString: env.DATABASE_URL })
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV || 'development' })
})

app.get('/db-health', async (req, res) => {
  if (!isDatabaseConfigured) {
    return res.status(503).json({ status: 'unavailable', message: 'DATABASE_URL not configured' })
  }

  try {
    const result = await pool.query('SELECT 1 AS ok')
    if (result.rows[0].ok === 1) {
      return res.json({ status: 'ok', db: 'connected' })
    }
    return res.status(500).json({ status: 'error', db: 'unexpected result' })
  } catch (error) {
    return res.status(500).json({ status: 'error', db: 'connection failure', message: error.message })
  }
})

app.get('/hello-new-world', (_req, res) => {
  res.json({ message: 'Hello new world' })
})

export { app, pool }

