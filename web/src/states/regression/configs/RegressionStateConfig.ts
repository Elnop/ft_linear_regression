import type { RegressionState } from '@/states/regression/types/RegressionTypes.ts';

export const IDLE_REGRESSION: Omit<RegressionState, 'samples'> = {
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
};
