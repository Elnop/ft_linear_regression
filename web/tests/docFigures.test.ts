import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseDataset } from '@core/parseDataset.ts';
import { docFigures } from '@/features/docs/lib/docFigures.ts';
import { scientific } from '@/features/docs/lib/scientific.ts';

const figures = docFigures(parseDataset(readFileSync(new URL('../../data.csv', import.meta.url), 'utf8')));

test('the figures of data.csv', () => {
  assert.equal(figures.sampleCount, 24);
  assert.deepEqual(figures.firstSamples[0], { km: 240000, price: 3650 });
  assert.equal(figures.kmMin, 22899);
  assert.equal(figures.kmMax, 240000);
  assert.equal(figures.divergenceIteration, 392);
  assert.equal(figures.r2.toFixed(4), '0.7330');
  assert.equal(figures.rmse.toFixed(2), '667.57');
  assert.equal(figures.mae.toFixed(2), '557.84');
  assert.equal(figures.examplePrice.toFixed(2), '6354.70');
  assert.equal(figures.descent.cost.toFixed(2), '222822.62');
});

test('gradient descent lands on the least squares solution', () => {
  assert.ok(Math.abs(figures.descent.theta0 - figures.leastSquares.theta0) < 1e-6);
  assert.ok(Math.abs(figures.descent.theta1 - figures.leastSquares.theta1) < 1e-12);
});

test('scientific notation the french way', () => {
  assert.equal(scientific(figures.meanSquaredKm), '1,3 × 10¹⁰');
  assert.equal(scientific(0.00042), '4,2 × 10⁻⁴');
});
