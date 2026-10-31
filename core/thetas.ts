import type { Thetas } from './CoreTypes.ts';

export function hasFiniteThetas(thetas: Thetas): boolean {
  return Number.isFinite(thetas.theta0) && Number.isFinite(thetas.theta1);
}
