import { createStore } from 'zustand/vanilla';
import { DEFAULT_TRAIN } from '@/states/regression/configs/TrainingConfig.ts';
import { willDiverge } from '@/states/regression/lib/willDiverge.ts';
import type { TrainingOptionsState } from '@/states/regression/types/RegressionTypes.ts';

export const trainingOptionsStore = createStore<TrainingOptionsState>()((set) => ({
  learningRate: DEFAULT_TRAIN.learningRate,
  willDiverge: willDiverge(DEFAULT_TRAIN.learningRate),
  setLearningRate: (learningRate) => set({ learningRate, willDiverge: willDiverge(learningRate) }),
}));
