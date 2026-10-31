import type { SequenceState } from '@/features/wall/sequence/types/SequenceTypes.ts';

export const IDLE_STATE: SequenceState = {
  phase: 'idle',
  visiblePoints: 0,
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
  trainingActive: false,
};
