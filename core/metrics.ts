import { estimatePrice } from './hypothesis.ts';
import type { Sample, Thetas } from './types.ts';

function errors(data: Sample[], thetas: Thetas): number[] {
  return data.map(({ km, price }) => estimatePrice(thetas, km) - price);
}

export function cost(data: Sample[], thetas: Thetas): number {
  const squared = errors(data, thetas).reduce((sum, e) => sum + e * e, 0);
  return squared / (2 * data.length);
}

export function rmse(data: Sample[], thetas: Thetas): number {
  const squared = errors(data, thetas).reduce((sum, e) => sum + e * e, 0);
  return Math.sqrt(squared / data.length);
}

export function mae(data: Sample[], thetas: Thetas): number {
  const absolute = errors(data, thetas).reduce((sum, e) => sum + Math.abs(e), 0);
  return absolute / data.length;
}

export function r2(data: Sample[], thetas: Thetas): number {
  const mean = data.reduce((sum, { price }) => sum + price, 0) / data.length;
  const ssTot = data.reduce((sum, { price }) => sum + (price - mean) ** 2, 0);
  const ssRes = errors(data, thetas).reduce((sum, e) => sum + e * e, 0);
  if (ssTot === 0) return ssRes === 0 ? 1 : 0;
  return 1 - ssRes / ssTot;
}
