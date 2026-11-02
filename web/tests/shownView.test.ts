import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shownView } from '@/features/dashboard/shared/lib/shownView.ts';

test('the chosen view is shown when the wall is painted', () => {
  assert.equal(shownView('wall', true), 'wall');
  assert.equal(shownView('chart', true), 'chart');
});

test('without paint, the empty wall view is replaced by the chart', () => {
  assert.equal(shownView('wall', false), 'chart');
  assert.equal(shownView('dataset', false), 'dataset');
});
