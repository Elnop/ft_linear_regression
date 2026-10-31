import { createStore } from 'zustand/vanilla';
import { DATA } from '@/features/model/configs/DatasetConfig.ts';
import { IDLE_MODEL } from '@/features/model/configs/ModelStateConfig.ts';
import type { ModelSnapshot, ModelState } from '@/features/model/types/ModelTypes.ts';

export const modelStore = createStore<ModelState>()(() => ({ samples: DATA, ...IDLE_MODEL }));

export const modelActions = {
  reset: () => modelStore.setState(IDLE_MODEL),
  show: ({ thetas, iteration, metrics, history }: ModelSnapshot) =>
    modelStore.setState({ thetas: { theta0: thetas.theta0, theta1: thetas.theta1 }, iteration, metrics, costHistory: history }),
  restart: () => modelStore.setState({ diverged: false, costHistory: [] }),
  finish: (diverged: boolean) => modelStore.setState({ diverged }),
};
