import type { Thetas } from './types.ts';

export function estimatePrice(thetas: Thetas, mileage: number): number {
  return thetas.theta0 + thetas.theta1 * mileage;
}
