import { hasFiniteThetas } from '@core/hasFiniteThetas.ts';
import type { RegressionState } from '@/states/regression/RegressionTypes.ts';

export function selectUsableThetas(state: RegressionState) {
  return state.thetas && !state.diverged && hasFiniteThetas(state.thetas) ? state.thetas : null;
}
