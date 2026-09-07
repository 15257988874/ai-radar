import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the application exposes a dedicated complete-news route', async () => {
  const router = await readFile(new URL('../src/router.js', import.meta.url), 'utf8')

  assert.match(router, /path: '\/news'/)
  assert.match(router, /NewsView/)
})

test('the router uses Vite base URL so GitHub Pages project routes retain the repository prefix', async () => {
  const router = await readFile(new URL('../src/router.js', import.meta.url), 'utf8')

  assert.match(router, /createWebHistory\(import\.meta\.env\.BASE_URL\)/)
})
