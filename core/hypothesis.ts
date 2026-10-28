import type { Thetas } from './types.ts';

// estimatePrice(mileage) = θ0 + (θ1 * mileage)
export function estimatePrice(thetas: Thetas, mileage: number): number {
  return thetas.theta0 + thetas.theta1 * mileage;
}
