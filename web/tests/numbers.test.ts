import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseMileage } from '@core/parseMileage.ts';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { normalizeMileage } from '@/features/dashboard/shared/lib/normalizeMileage.ts';

test('formats with narrow spaces, a real minus and compact large values', () => {
  assert.equal(formatNumber(1234567), '1 234 567');
  assert.equal(formatNumber(-12.345, 2), '−12.35');
  assert.equal(formatNumber(-0.001, 2), '0.00');
  assert.equal(formatNumber(2.5e12), '2.5e12');
  assert.equal(formatNumber(Infinity), '∞');
  assert.equal(formatNumber(null), '—');
});

test('reads mileages typed the french way', () => {
  assert.equal(parseMileage(normalizeMileage('100 000')), 100000);
  assert.equal(parseMileage(normalizeMileage('100 000')), 100000);
  assert.equal(parseMileage(normalizeMileage('100,5')), 100.5);
  assert.equal(parseMileage(normalizeMileage(formatNumber(240000))), 240000);
});
