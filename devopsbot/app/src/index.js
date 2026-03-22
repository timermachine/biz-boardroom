/* eslint-disable no-undef */
import { app } from './app.js'

const port = globalThis.process?.env?.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'Hello from myapp' })
})

app.listen(port, () => {
  globalThis.console.log(`Server running on port ${port} [${globalThis.process?.env?.NODE_ENV}]`)
})
