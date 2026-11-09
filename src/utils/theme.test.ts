import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleTheme, normalizeTheme, THEME_METAS } from './theme';

test('normalizeTheme defaults to "default" for undefined, null, or unrecognized strings', () => {
  assert.equal(normalizeTheme(undefined), 'default');
  assert.equal(normalizeTheme(null), 'default');
  assert.equal(normalizeTheme('ocean-deep'), 'default');
  assert.equal(normalizeTheme('default'), 'default');
  assert.equal(normalizeTheme('random-theme'), 'default');
});

test('normalizeTheme preserves "midnight-forest"', () => {
  assert.equal(normalizeTheme('midnight-forest'), 'midnight-forest');
});

test('toggleTheme toggles cleanly between "default" and "midnight-forest"', () => {
  assert.equal(toggleTheme('default'), 'midnight-forest');
  assert.equal(toggleTheme('midnight-forest'), 'default');
  assert.equal(toggleTheme('ocean-deep'), 'midnight-forest');
});

test('THEME_METAS provides metadata for both supported themes', () => {
  assert.ok(THEME_METAS['default']);
  assert.equal(THEME_METAS['default'].name, 'Default (Blue-Cyan)');
  assert.equal(THEME_METAS['default'].accentColor, '#06b6d4');

  assert.ok(THEME_METAS['midnight-forest']);
  assert.equal(THEME_METAS['midnight-forest'].name, 'Midnight Forest (Emerald-Jade)');
  assert.equal(THEME_METAS['midnight-forest'].accentColor, '#10b981');
});
