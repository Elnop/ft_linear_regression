import type { ModelState } from '@/features/model/types/ModelTypes.ts';

export const IDLE_MODEL: Omit<ModelState, 'samples'> = {
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
};
