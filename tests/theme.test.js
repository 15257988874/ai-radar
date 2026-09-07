import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoredTheme } from '../src/theme.js';

test('resolveStoredTheme defaults to light when no explicit reader choice exists', () => {
  assert.equal(resolveStoredTheme(null), 'light');
  assert.equal(resolveStoredTheme('system'), 'light');
});

test('resolveStoredTheme keeps an explicit dark choice', () => {
  assert.equal(resolveStoredTheme('dark'), 'dark');
});
