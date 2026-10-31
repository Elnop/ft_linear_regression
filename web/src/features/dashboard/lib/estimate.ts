import { estimatePrice } from '@core/hypothesis.ts';
import type { Thetas } from '@core/types.ts';

const DISPLAYABLE_LIMIT = 1e7;

export function displayableEstimate(thetas: Thetas | null, km: number): number | null {
  if (!thetas) return null;
  const price = estimatePrice(thetas, km);
  return Number.isFinite(price) && Math.abs(price) < DISPLAYABLE_LIMIT ? price : null;
}
