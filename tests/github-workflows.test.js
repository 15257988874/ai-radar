import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

/**
 * Reads a repository text file through a test-relative URL.
 * @param {string} path Repository-relative file path.
 * @returns {Promise<string>} UTF-8 source content.
 */
function readProjectFile(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('refresh workflow schedules public data collection and writes only repository content', async () => {
  const workflow = await readProjectFile('.github/workflows/refresh-data.yml');

  assert.match(workflow, /cron: '20 \* \* \* \*'/);
  assert.match(workflow, /contents: write/);
  assert.match(workflow, /npm run data:refresh/);
  assert.match(workflow, /git diff --quiet -- public\/data data\/snapshots/);
});

test('Pages workflow builds on main and uses the required deployment permissions', async () => {
  const workflow = await readProjectFile('.github/workflows/deploy-pages.yml');
  const viteConfig = await readProjectFile('vite.config.js');

  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /actions\/deploy-pages/);
  assert.match(viteConfig, /GITHUB_REPOSITORY/);
});
