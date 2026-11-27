import { createStore } from 'zustand/vanilla';
import { DEFAULT_TRAIN } from '@core/configs/TrainingConfig.ts';
import { willDiverge } from '@/features/dashboard/features/training/willDiverge.ts';
import type { TrainingOptionsState } from '@/shared/regression/RegressionTypes.ts';

export const trainingOptionsStore = createStore<TrainingOptionsState>()((set) => ({
  learningRate: DEFAULT_TRAIN.learningRate,
  willDiverge: willDiverge(DEFAULT_TRAIN.learningRate),
  setLearningRate: (learningRate) => set({ learningRate, willDiverge: willDiverge(learningRate) }),
}));
