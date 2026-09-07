import assert from 'node:assert/strict';
import test from 'node:test';
import { loadLiveNews, loadLiveTrending } from '../src/live-data-client.js';

const generatedAt = '2026-09-05T03:00:00.000Z';

test('loadLiveNews accepts a complete generated news payload', async () => {
  const payload = {
    generatedAt,
    sourceLabel: '官方公开 RSS / Atom',
    items: [{ id: 'live-news', title: 'Live news', summary: 'Source-backed summary.', source: 'OpenAI', time: '最新收录', theme: 'official', url: 'https://example.com/news', publishedAt: generatedAt }],
  };
  const result = await loadLiveNews(async () => Response.json(payload));

  assert.equal(result.data?.items[0].title, 'Live news');
  assert.equal(result.generatedAt, generatedAt);
  assert.equal(result.sourceLabel, '官方公开 RSS / Atom');
});

test('loadLiveNews keeps the caller fallback path available after an unavailable payload', async () => {
  const result = await loadLiveNews(async () => { throw new Error('offline'); });

  assert.deepEqual(result, { data: null, generatedAt: null, sourceLabel: null });
});

test('loadLiveTrending accepts a complete GitHub board while rejecting incomplete data', async () => {
  const validPayload = {
    generatedAt,
    sourceLabel: 'GitHub API 公开仓库搜索',
    boards: { GitHub: { daily: [{ name: 'example/live', description: 'Live project', language: 'JavaScript', stars: '3k', change: '今日入榜', url: 'https://github.com/example/live' }], weekly: [], monthly: [] } },
  };
  const validResult = await loadLiveTrending(async () => Response.json(validPayload));
  const invalidResult = await loadLiveTrending(async () => Response.json({ generatedAt, boards: {} }));

  assert.equal(validResult.data?.boards.GitHub.daily[0].name, 'example/live');
  assert.equal(invalidResult.data, null);
});
