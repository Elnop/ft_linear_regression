import { expect, test } from 'vitest';
import { scientific } from '@/features/docs/lib/scientific.ts';

test('scientific notation the french way', () => {
  expect(scientific(12_845_000_000)).toBe('1,3 × 10¹⁰');
  expect(scientific(0.00042)).toBe('4,2 × 10⁻⁴');
});
