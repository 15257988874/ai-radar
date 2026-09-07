import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, trendingBoards } from '../src/catalog.js';

test('the directory data has complete tool and open-source collections with direct destinations', () => {
  const tools = catalog.filter((item) => item.kind === '工具');
  const openSource = catalog.filter((item) => item.kind === '开源');

  assert.ok(tools.length >= 16);
  assert.ok(openSource.length >= 16);
  assert.ok(catalog.every((item) => item.url.startsWith('https://')));
});

test('the open-source trend board exposes daily, weekly, and monthly GitHub rankings', () => {
  assert.ok(trendingBoards.GitHub);
  assert.equal(trendingBoards.GitHub.daily.length, 10);
  assert.equal(trendingBoards.GitHub.weekly.length, 10);
  assert.equal(trendingBoards.GitHub.monthly.length, 10);
});

test('the router declares complete page routes for all four homepage sections', async () => {
  const { readFile } = await import('node:fs/promises');
  const router = await readFile(new URL('../src/router.js', import.meta.url), 'utf8');

  for (const path of ['/news', '/tools', '/opensource', '/ranking']) {
    assert.match(router, new RegExp(`path: '${path.replace('/', '\\/')}'`));
  }
});
