import { expect, test } from 'vitest';
import raw from '@dataset?raw';
import { parseDataset } from '@core/parseDataset.ts';
import { docFigures } from '@/features/docs/lib/docFigures.ts';

const figures = docFigures(parseDataset(raw));

test('the figures of data.csv', () => {
  expect(figures.sampleCount).toBe(24);
  expect(figures.firstSamples[0]).toStrictEqual({ km: 240000, price: 3650 });
  expect(figures.kmMin).toBe(22899);
  expect(figures.kmMax).toBe(240000);
  expect(figures.divergenceIteration).toBe(392);
  expect(figures.r2.toFixed(4)).toBe('0.7330');
  expect(figures.rmse.toFixed(2)).toBe('667.57');
  expect(figures.mae.toFixed(2)).toBe('557.84');
  expect(figures.examplePrice.toFixed(2)).toBe('6354.70');
  expect(figures.descent.cost.toFixed(2)).toBe('222822.62');
});

test('gradient descent lands on the least squares solution', () => {
  expect(Math.abs(figures.descent.theta0 - figures.leastSquares.theta0) < 1e-6).toBe(true);
  expect(Math.abs(figures.descent.theta1 - figures.leastSquares.theta1) < 1e-12).toBe(true);
});
