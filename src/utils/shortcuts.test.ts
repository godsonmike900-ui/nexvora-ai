import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveShortcutAction } from './shortcuts';

test('resolveShortcutAction maps Alt+1 to dashboard, Alt+3 to marketing, Alt+8 to settings, Alt+9 to legal', () => {
  assert.deepEqual(resolveShortcutAction({ key: '1', altKey: true }), { view: 'dashboard' });
  assert.deepEqual(resolveShortcutAction({ key: '3', altKey: true }), { view: 'marketing' });
  assert.deepEqual(resolveShortcutAction({ key: '8', altKey: true }), { view: 'settings' });
  assert.deepEqual(resolveShortcutAction({ key: '9', altKey: true }), { view: 'legal' });
});

test('resolveShortcutAction maps letter shortcuts Alt+D, Alt+M, Alt+S, Alt+L', () => {
  assert.deepEqual(resolveShortcutAction({ key: 'd', altKey: true }), { view: 'dashboard' });
  assert.deepEqual(resolveShortcutAction({ key: 'm', altKey: true }), { view: 'marketing' });
  assert.deepEqual(resolveShortcutAction({ key: 's', altKey: true }), { view: 'settings' });
  assert.deepEqual(resolveShortcutAction({ key: 'l', altKey: true }), { view: 'legal' });
});

test('resolveShortcutAction triggers shortcuts modal on ? or Ctrl+/', () => {
  assert.deepEqual(resolveShortcutAction({ key: '?' }), { specialAction: 'toggleShortcutsModal' });
  assert.deepEqual(resolveShortcutAction({ key: '/', ctrlKey: true }), { specialAction: 'toggleShortcutsModal' });
});

test('resolveShortcutAction ignores plain typing in input fields', () => {
  assert.equal(resolveShortcutAction({ key: '?', targetTagName: 'INPUT' }), null);
  assert.equal(resolveShortcutAction({ key: 'm', targetTagName: 'TEXTAREA' }), null);
});

test('resolveShortcutAction gracefully handles undefined, null, or malformed events without throwing', () => {
  assert.equal(resolveShortcutAction(undefined), null);
  assert.equal(resolveShortcutAction(null), null);
  assert.equal(resolveShortcutAction({} as any), null);
  assert.equal(resolveShortcutAction({ key: undefined } as any), null);
  assert.equal(resolveShortcutAction({ key: '' }), null);
});

