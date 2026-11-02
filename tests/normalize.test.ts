import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estimatePrice } from '../core/estimatePrice.ts';
import { computeScale, denormalizeThetas, normalizeSamples } from '../core/normalize.ts';

test('computes the min and max of the values', () => {
  assert.deepEqual(computeScale([30, 10, 20]), { min: 10, max: 30 });
});

test('handles datasets far larger than the call stack allows to spread', () => {
  const values = Array.from({ length: 200_000 }, (_, i) => i * 2);
  assert.deepEqual(computeScale(values), { min: 0, max: 399_998 });
});

test('refuses a scale it cannot divide by', () => {
  assert.throws(() => computeScale([]), /empty set/);
  assert.throws(() => computeScale([5, 5]), /all mileages are identical/);
});

test('maps mileages into [0, 1] and keeps prices', () => {
  const scale = { min: 10, max: 30 };
  assert.deepEqual(
    normalizeSamples(
      [
        { km: 10, price: 1 },
        { km: 20, price: 2 },
        { km: 30, price: 3 },
      ],
      scale,
    ),
    [
      { km: 0, price: 1 },
      { km: 0.5, price: 2 },
      { km: 1, price: 3 },
    ],
  );
});

test('denormalized thetas predict on raw km what normalized thetas predict on normalized km', () => {
  const scale = { min: 22899, max: 240000 };
  const normalized = { theta0: 8000, theta1: -4500 };
  const raw = denormalizeThetas(normalized, scale);
  for (const km of [0, 22899, 100000, 240000]) {
    const normalizedKm = (km - scale.min) / (scale.max - scale.min);
    assert.ok(Math.abs(estimatePrice(raw, km) - estimatePrice(normalized, normalizedKm)) < 1e-9);
  }
});
