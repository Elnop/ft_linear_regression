import { createStore } from 'zustand/vanilla';
import { DEFAULT_TRAIN } from '@/features/model/configs/TrainingConfig.ts';
import { willDiverge } from '@/features/model/lib/willDiverge.ts';
import type { TrainingOptionsState } from '@/features/model/types/ModelTypes.ts';

export const trainingOptionsStore = createStore<TrainingOptionsState>()((set) => ({
  learningRate: DEFAULT_TRAIN.learningRate,
  willDiverge: willDiverge(DEFAULT_TRAIN.learningRate),
  setLearningRate: (learningRate) => set({ learningRate, willDiverge: willDiverge(learningRate) }),
}));
