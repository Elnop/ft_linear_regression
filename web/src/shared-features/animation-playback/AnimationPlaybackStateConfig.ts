import type { AnimationPlaybackActions, AnimationPlaybackState } from '@/shared-features/animation-playback/AnimationPlaybackTypes.ts';

export const IDLE_PLAYBACK: AnimationPlaybackState = {
  phase: 'idle',
  visiblePoints: 0,
  trainingActive: false,
  painted: true,
};

export const IDLE_PLAYBACK_ACTIONS: AnimationPlaybackActions = {
  skip: () => {},
  train: async () => {},
  replay: () => {},
};
