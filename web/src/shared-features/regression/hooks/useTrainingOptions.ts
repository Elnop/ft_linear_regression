import { useStore } from 'zustand';
import { trainingOptionsStore } from '@/shared-features/regression/stores/trainingOptionsStore.ts';
import type { TrainingOptionsState } from '@/shared-features/regression/RegressionTypes.ts';

export function useTrainingOptions<T>(selector: (state: TrainingOptionsState) => T): T {
  return useStore(trainingOptionsStore, selector);
}
