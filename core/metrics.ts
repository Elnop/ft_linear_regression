import { estimatePrice } from './hypothesis.ts';
import type { Sample, Thetas } from './types.ts';

function errors(data: Sample[], thetas: Thetas): number[] {
  return data.map(({ km, price }) => estimatePrice(thetas, km) - price);
}

export function cost(data: Sample[], thetas: Thetas): number {
  const squared = errors(data, thetas).reduce((sum, error) => sum + error * error, 0);
  return squared / (2 * data.length);
}

export function rmse(data: Sample[], thetas: Thetas): number {
  const squared = errors(data, thetas).reduce((sum, error) => sum + error * error, 0);
  return Math.sqrt(squared / data.length);
}

export function mae(data: Sample[], thetas: Thetas): number {
  const absolute = errors(data, thetas).reduce((sum, error) => sum + Math.abs(error), 0);
  return absolute / data.length;
}

export function r2(data: Sample[], thetas: Thetas): number {
  const mean = data.reduce((sum, { price }) => sum + price, 0) / data.length;
  const totalSumOfSquares = data.reduce((sum, { price }) => sum + (price - mean) ** 2, 0);
  const residualSumOfSquares = errors(data, thetas).reduce((sum, error) => sum + error * error, 0);
  if (totalSumOfSquares === 0) return residualSumOfSquares === 0 ? 1 : 0;
  return 1 - residualSumOfSquares / totalSumOfSquares;
}
