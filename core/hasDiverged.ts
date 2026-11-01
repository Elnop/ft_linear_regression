import { hasFiniteThetas } from './hasFiniteThetas.ts';
import type { TrainStep } from './types/CoreTypes.ts';

export function hasDiverged(step: TrainStep): boolean {
  return !hasFiniteThetas(step) || !Number.isFinite(step.cost);
}
