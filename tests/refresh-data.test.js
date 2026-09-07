import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runRefresh } from '../scripts/refresh-data.mjs';

const fixedNow = new Date('2026-09-05T03:00:00.000Z');
const newsXml = `<?xml version="1.0"?><rss><channel><item><title>Collector news</title><link>https://example.com/news/collector</link><description>Live source entry.</description><pubDate>Fri, 05 Sep 2026 00:00:00 GMT</pubDate></item></channel></rss>`;
const githubSearch = {
  items: [{
    full_name: 'example/live-agent',
    description: 'A reliable public AI agent.',
    html_url: 'https://github.com/example/live-agent',
    stargazers_count: 3000,
    language: 'JavaScript',
  }],
};

/**
 * Creates deterministic public-source responses for collector tests.
 * @param {string} url Requested source URL.
 * @returns {Promise<Response>} Fixture response.
 */
async function fixtureFetch(url) {
  if (url.includes('api.github.com')) return Response.json(githubSearch);
  return new Response(newsXml, { headers: { 'content-type': 'application/rss+xml' } });
}

test('runRefresh writes valid source payloads and a dated GitHub snapshot', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'ai-radar-refresh-'));
  const result = await runRefresh({
    fetchImpl: fixtureFetch,
    now: fixedNow,
    rootDir,
    sources: [{ name: 'Fixture News', feedUrl: 'https://example.com/feed.xml' }],
  });

  const news = JSON.parse(await readFile(join(rootDir, 'public/data/news.json'), 'utf8'));
  const trending = JSON.parse(await readFile(join(rootDir, 'public/data/trending.json'), 'utf8'));
  const snapshot = JSON.parse(await readFile(join(rootDir, 'data/snapshots/github-2026-09-05.json'), 'utf8'));

  assert.equal(result.changed, true);
  assert.equal(news.items.length, 1);
  assert.equal(news.items[0].source, 'Fixture News');
  assert.equal(trending.boards.GitHub.daily[0].name, 'example/live-agent');
  assert.equal(snapshot.items.length, 1);
});

test('runRefresh does not replace prior valid JSON with empty source results', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'ai-radar-preserve-'));
  const newsPath = join(rootDir, 'public/data/news.json');
  const existingPayload = JSON.stringify({ generatedAt: fixedNow.toISOString(), sourceLabel: 'existing', items: [{ id: 'keep', title: 'Keep me' }] });
  await (await import('node:fs/promises')).mkdir(join(rootDir, 'public/data'), { recursive: true });
  await writeFile(newsPath, existingPayload);

  const result = await runRefresh({
    fetchImpl: async () => Response.json({ items: [] }),
    now: fixedNow,
    rootDir,
    sources: [{ name: 'Broken Feed', feedUrl: 'https://example.com/broken.xml' }],
  });

  assert.equal(result.changed, false);
  assert.equal(await readFile(newsPath, 'utf8'), existingPayload);
});

test('runRefresh creates at most one GitHub board snapshot for a UTC day', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'ai-radar-daily-board-'));
  await runRefresh({
    fetchImpl: fixtureFetch,
    now: fixedNow,
    rootDir,
    sources: [{ name: 'Fixture News', feedUrl: 'https://example.com/feed.xml' }],
  });
  let githubCalls = 0;
  await runRefresh({
    fetchImpl: async (url) => {
      if (url.includes('api.github.com')) githubCalls += 1;
      return new Response(newsXml, { headers: { 'content-type': 'application/rss+xml' } });
    },
    now: new Date('2026-09-05T18:00:00.000Z'),
    rootDir,
    sources: [{ name: 'Fixture News', feedUrl: 'https://example.com/feed.xml' }],
  });

  assert.equal(githubCalls, 0);
  assert.equal(JSON.parse(await readFile(join(rootDir, 'data/snapshots/github-2026-09-05.json'), 'utf8')).items[0].name, 'example/live-agent');
});
