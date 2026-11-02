import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextTab } from '@/features/docs/lib/nextTab.ts';

test('arrows wrap around, Home and End jump to the ends', () => {
  assert.equal(nextTab('ArrowRight', 0, 3), 1);
  assert.equal(nextTab('ArrowRight', 2, 3), 0);
  assert.equal(nextTab('ArrowLeft', 0, 3), 2);
  assert.equal(nextTab('Home', 2, 3), 0);
  assert.equal(nextTab('End', 0, 3), 2);
});

test('other keys do nothing', () => {
  assert.equal(nextTab('Enter', 1, 3), null);
  assert.equal(nextTab('a', 1, 3), null);
});
