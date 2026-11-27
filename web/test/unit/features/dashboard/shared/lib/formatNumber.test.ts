import { expect, test } from 'vitest';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';

test('formats with narrow spaces, a real minus and compact large values', () => {
  expect(formatNumber(1234567)).toBe('1 234 567');
  expect(formatNumber(-12.345, 2)).toBe('−12.35');
  expect(formatNumber(-0.001, 2)).toBe('0.00');
  expect(formatNumber(2.5e12)).toBe('2.5e12');
  expect(formatNumber(Infinity)).toBe('∞');
  expect(formatNumber(null)).toBe('—');
});
