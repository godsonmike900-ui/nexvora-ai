import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createToast,
  addToast,
  removeToast,
  getToastTheme,
  DEFAULT_TOAST_DURATION,
} from './toastManager';

test('createToast generates a toast with id, default duration, and timestamp', () => {
  const toast = createToast({
    type: 'success',
    title: 'Invoice Created',
    message: 'NEX-2026-0099 has been generated',
  });

  assert.ok(toast.id.startsWith('toast-'));
  assert.equal(toast.title, 'Invoice Created');
  assert.equal(toast.type, 'success');
  assert.equal(toast.duration, DEFAULT_TOAST_DURATION);
  assert.ok(toast.timestamp > 0);
});

test('createToast respects custom duration', () => {
  const toast = createToast({
    type: 'info',
    title: 'Processing',
    duration: 8000,
  });

  assert.equal(toast.duration, 8000);
});

test('addToast prepends new toasts and limits max queue size', () => {
  let list = addToast([], { type: 'success', title: 'Action 1' }, 3);
  assert.equal(list.length, 1);
  assert.equal(list[0].title, 'Action 1');

  list = addToast(list, { type: 'info', title: 'Action 2' }, 3);
  assert.equal(list.length, 2);
  assert.equal(list[0].title, 'Action 2');

  list = addToast(list, { type: 'warning', title: 'Action 3' }, 3);
  assert.equal(list.length, 3);
  assert.equal(list[0].title, 'Action 3');

  // Exceed limit of 3
  list = addToast(list, { type: 'error', title: 'Action 4' }, 3);
  assert.equal(list.length, 3);
  assert.equal(list[0].title, 'Action 4');
  assert.equal(list[1].title, 'Action 3');
  assert.equal(list[2].title, 'Action 2');
  // 'Action 1' dropped
  assert.ok(!list.some((t) => t.title === 'Action 1'));
});

test('removeToast filters out the target item by id', () => {
  const t1 = createToast({ type: 'success', title: 'First' }, 'abc');
  const t2 = createToast({ type: 'info', title: 'Second' }, 'xyz');
  const current = [t1, t2];

  const updated = removeToast(current, t1.id);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, t2.id);

  // Removing non-existent ID leaves list intact
  const unaffected = removeToast(updated, 'non-existent');
  assert.equal(unaffected.length, 1);
});

test('getToastTheme returns distinctive styling configs for each toast type', () => {
  const successTheme = getToastTheme('success');
  assert.ok(successTheme.border.includes('emerald'));
  assert.ok(successTheme.iconColor.includes('emerald'));

  const errorTheme = getToastTheme('error');
  assert.ok(errorTheme.border.includes('rose'));
  assert.ok(errorTheme.iconColor.includes('rose'));

  const warningTheme = getToastTheme('warning');
  assert.ok(warningTheme.border.includes('amber'));
  assert.ok(warningTheme.iconColor.includes('amber'));

  const infoTheme = getToastTheme('info');
  assert.ok(infoTheme.border.includes('cyan'));
  assert.ok(infoTheme.iconColor.includes('cyan'));
});
