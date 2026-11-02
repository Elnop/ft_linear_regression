import { hasFiniteThetas } from '@core/hasFiniteThetas.ts';
import type { RegressionState } from '@/states/regression/RegressionTypes.ts';

export const selectUsableThetas = (state: RegressionState) => (state.thetas && !state.diverged && hasFiniteThetas(state.thetas) ? state.thetas : null);
