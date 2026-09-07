import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the Vue homepage uses the approved prototype visual structure', async () => {
  const component = await readFile(new URL('../src/App.vue', import.meta.url), 'utf8')

  for (const className of ['topbar', 'signal-hero', 'feature-card', 'rail-card', 'tool-card', 'footer']) {
    assert.match(component, new RegExp(`class=\"[^\"]*${className}`))
  }
})

test('the resource directory defaults to a curated preview with an explicit expand action', async () => {
  const component = await readFile(new URL('../src/App.vue', import.meta.url), 'utf8')

  assert.match(component, /const displayedResources = computed/)
  assert.match(component, /v-for="item in displayedResources"/)
  assert.match(component, /查看完整目录/)
})
