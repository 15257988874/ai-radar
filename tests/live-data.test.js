import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createTrendingBoard, mergeRollingSnapshots, normalizeNewsFeed } from '../src/live-data.js';

const fixtureUrl = new URL('./fixtures/', import.meta.url);
const generatedAt = '2026-09-05T03:00:00.000Z';

test('normalizeNewsFeed keeps valid entries and removes canonical URL duplicates', async () => {
  const xml = await readFile(new URL('news-feed.xml', fixtureUrl), 'utf8');
  const stories = normalizeNewsFeed(xml, 'OpenAI', 'https://openai.com/news/', generatedAt);

  assert.equal(stories.length, 1);
  assert.equal(stories[0].source, 'OpenAI');
  assert.equal(stories[0].url, 'https://openai.com/index/practical-agent-guide');
  assert.equal(stories[0].publishedAt, '2026-09-05T00:00:00.000Z');
});

test('createTrendingBoard maps public GitHub search items into direct-link board entries', async () => {
  const rawSearch = JSON.parse(await readFile(new URL('github-search.json', fixtureUrl), 'utf8'));
  const board = createTrendingBoard(rawSearch, generatedAt);

  assert.equal(board.generatedAt, generatedAt);
  assert.equal(board.items.length, 2);
  assert.deepEqual(board.items[0], {
    name: 'example/agent-kit',
    description: 'A public toolkit for building reliable AI agents.',
    language: 'TypeScript',
    stars: '4.2k',
    change: '今日入榜',
    url: 'https://github.com/example/agent-kit',
  });
});

test('mergeRollingSnapshots produces daily weekly and monthly boards from valid snapshots', async () => {
  const rawSearch = JSON.parse(await readFile(new URL('github-search.json', fixtureUrl), 'utf8'));
  const snapshot = createTrendingBoard(rawSearch, generatedAt);
  const payload = mergeRollingSnapshots([snapshot], generatedAt);

  assert.equal(payload.generatedAt, generatedAt);
  assert.equal(payload.sourceLabel, 'GitHub API 公开仓库搜索');
  assert.equal(payload.boards.GitHub.daily.length, 2);
  assert.equal(payload.boards.GitHub.weekly[0].change, '近7日入榜 1 天');
  assert.equal(payload.boards.GitHub.monthly[0].change, '近30日入榜 1 天');
});
