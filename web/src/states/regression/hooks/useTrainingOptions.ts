import { useStore } from 'zustand';
import { trainingOptionsStore } from '@/states/regression/stores/trainingOptionsStore.ts';
import type { TrainingOptionsState } from '@/states/regression/RegressionTypes.ts';

export function useTrainingOptions<T>(selector: (state: TrainingOptionsState) => T): T {
  return useStore(trainingOptionsStore, selector);
}
