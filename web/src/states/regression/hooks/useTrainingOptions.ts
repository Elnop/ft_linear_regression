import { useStore } from 'zustand';
import { trainingOptionsStore } from '@/states/regression/stores/trainingOptionsStore.ts';
import type { TrainingOptionsState } from '@/states/regression/types/RegressionTypes.ts';

export const useTrainingOptions = <T,>(selector: (state: TrainingOptionsState) => T): T => useStore(trainingOptionsStore, selector);
