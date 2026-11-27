import { useStore } from 'zustand';
import { trainingOptionsStore } from '@/features/dashboard/features/training/trainingOptionsStore.ts';
import type { TrainingOptionsState } from '@/shared/regression/RegressionTypes.ts';

export function useTrainingOptions<T>(selector: (state: TrainingOptionsState) => T): T {
  return useStore(trainingOptionsStore, selector);
}
