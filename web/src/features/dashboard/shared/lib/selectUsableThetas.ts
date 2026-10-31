import { hasFiniteThetas } from '@core/hasFiniteThetas.ts';
import type { RegressionState } from '@/states/regression/types/RegressionTypes.ts';

export const selectUsableThetas = (state: RegressionState) =>
  state.thetas && !state.diverged && hasFiniteThetas(state.thetas) ? state.thetas : null;
