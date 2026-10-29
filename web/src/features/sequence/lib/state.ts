import type { SequenceState } from '@/features/sequence/types.ts';
import { DATA, DEFAULT_TRAIN } from './training.ts';

export const IDLE_STATE: SequenceState = {
  phase: 'idle',
  visiblePoints: 0,
  totalPoints: DATA.length,
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
  trainingActive: false,
  skipping: false,
  trainOptions: DEFAULT_TRAIN,
};
