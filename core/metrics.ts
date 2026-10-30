import { estimatePrice } from './hypothesis.ts';
import type { Sample, Thetas } from './types.ts';

export function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function errors(data: Sample[], thetas: Thetas): number[] {
  return data.map(({ km, price }) => estimatePrice(thetas, km) - price);
}

export function sumOfSquaredErrors(data: Sample[], thetas: Thetas): number {
  return errors(data, thetas).reduce((sum, error) => sum + error * error, 0);
}

export function cost(data: Sample[], thetas: Thetas): number {
  return sumOfSquaredErrors(data, thetas) / (2 * data.length);
}

export function rmse(data: Sample[], thetas: Thetas): number {
  return Math.sqrt(sumOfSquaredErrors(data, thetas) / data.length);
}

export function mae(data: Sample[], thetas: Thetas): number {
  return mean(errors(data, thetas).map(Math.abs));
}

export function r2(data: Sample[], thetas: Thetas): number {
  const prices = data.map(({ price }) => price);
  const meanPrice = mean(prices);
  const totalSumOfSquares = prices.reduce((sum, price) => sum + (price - meanPrice) ** 2, 0);
  const residualSumOfSquares = sumOfSquaredErrors(data, thetas);
  if (totalSumOfSquares === 0) return residualSumOfSquares === 0 ? 1 : 0;
  return 1 - residualSumOfSquares / totalSumOfSquares;
}
