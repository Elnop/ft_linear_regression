import { createStore } from 'zustand/vanilla';
import { DATA } from '@/states/regression/configs/DatasetConfig.ts';
import { IDLE_REGRESSION } from '@/states/regression/configs/RegressionStateConfig.ts';
import type { RegressionActions, RegressionSnapshot, RegressionState } from '@/states/regression/RegressionTypes.ts';

export const regressionStore = createStore<RegressionState>()(() => ({ samples: DATA, ...IDLE_REGRESSION }));

export const regressionActions: RegressionActions = {
  reset: () => regressionStore.setState(IDLE_REGRESSION),
  show: ({ thetas, iteration, metrics, history }: RegressionSnapshot) =>
    regressionStore.setState({ thetas: { theta0: thetas.theta0, theta1: thetas.theta1 }, iteration, metrics, costHistory: history }),
  restart: () => regressionStore.setState({ diverged: false, costHistory: [] }),
  finish: (diverged: boolean) => regressionStore.setState({ diverged }),
};
