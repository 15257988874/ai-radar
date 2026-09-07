import test from 'node:test';
import assert from 'node:assert/strict';
import { newsStories } from '../src/catalog.js';

test('the complete news route has a substantial multi-topic editorial stream', () => {
  const topics = new Set(newsStories.map((story) => story.type));

  assert.ok(newsStories.length >= 24);
  assert.ok(topics.size >= 6);
});
