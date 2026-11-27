import { expect, test } from 'vitest';
import { parseMileage } from '@core/parseMileage.ts';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { normalizeMileage } from '@/features/dashboard/shared/lib/normalizeMileage.ts';

test('reads mileages typed the french way', () => {
  expect(parseMileage(normalizeMileage('100 000'))).toBe(100000);
  expect(parseMileage(normalizeMileage('100 000'))).toBe(100000);
  expect(parseMileage(normalizeMileage('100,5'))).toBe(100.5);
  expect(parseMileage(normalizeMileage(formatNumber(240000)))).toBe(240000);
});
