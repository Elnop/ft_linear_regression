import type { RegressionState } from '@/shared/regression/RegressionTypes.ts';

export const IDLE_REGRESSION: Omit<RegressionState, 'samples'> = {
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
};
