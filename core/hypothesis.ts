import type { Thetas } from './CoreTypes.ts';

export function estimatePrice(thetas: Thetas, mileage: number): number {
  return thetas.theta0 + thetas.theta1 * mileage;
}
