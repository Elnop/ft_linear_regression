import { hasFiniteThetas } from '@core/hasFiniteThetas.ts';
import type { RegressionState } from '@/shared-features/regression/RegressionTypes.ts';

export function selectUsableThetas(state: RegressionState) {
  return state.thetas && !state.diverged && hasFiniteThetas(state.thetas) ? state.thetas : null;
}
