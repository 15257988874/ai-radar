import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, newsStories, searchCatalog, searchNews, searchStories } from '../src/catalog.js';

test('searchCatalog finds the MCP marketplace with a Chinese query', () => {
  const results = searchCatalog('协议');

  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'MCP Market');
});

test('searchCatalog returns the full catalogue when the reader clears search', () => {
  const results = searchCatalog('   ');

  assert.equal(results.length, catalog.length);
  assert.ok(results.length > 6);
});

test('searchStories finds the generated-video story with a Chinese keyword', () => {
  const results = searchStories('视频');

  assert.equal(results.length, 1);
  assert.equal(results[0].title, '视频生成工具的控制能力，正在成为分水岭');
});

test('searchNews returns a complete reader-facing news stream and filters it by topic', () => {
  const results = searchNews('MCP');

  assert.ok(newsStories.length >= 12);
  assert.ok(results.length >= 1);
  assert.ok(results.every((story) => `${story.title} ${story.summary}`.includes('MCP')));
});
