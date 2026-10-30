import type { SequenceState } from '@/features/sequence/types.ts';
import { DEFAULT_TRAIN } from './training.ts';

export const IDLE_STATE: SequenceState = {
  phase: 'idle',
  visiblePoints: 0,
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
  trainingActive: false,
  trainOptions: DEFAULT_TRAIN,
};
