import { expect, test } from 'vitest';
import { shownView } from '@/features/dashboard/shared/lib/shownView.ts';

test('the chosen view is shown when the wall is painted', () => {
  expect(shownView('wall', true)).toBe('wall');
  expect(shownView('chart', true)).toBe('chart');
});

test('without paint, the empty wall view is replaced by the chart', () => {
  expect(shownView('wall', false)).toBe('chart');
  expect(shownView('dataset', false)).toBe('dataset');
});
