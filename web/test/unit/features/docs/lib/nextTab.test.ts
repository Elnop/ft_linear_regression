import { expect, test } from 'vitest';
import { nextTab } from '@/features/docs/lib/nextTab.ts';

test('arrows wrap around, Home and End jump to the ends', () => {
  expect(nextTab('ArrowRight', 0, 3)).toBe(1);
  expect(nextTab('ArrowRight', 2, 3)).toBe(0);
  expect(nextTab('ArrowLeft', 0, 3)).toBe(2);
  expect(nextTab('Home', 2, 3)).toBe(0);
  expect(nextTab('End', 0, 3)).toBe(2);
});

test('other keys do nothing', () => {
  expect(nextTab('Enter', 1, 3)).toBeNull();
  expect(nextTab('a', 1, 3)).toBeNull();
});
