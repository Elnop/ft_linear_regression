import type { AnimationPlaybackActions, AnimationPlaybackState } from '@/states/animation-playback/types/AnimationPlaybackTypes.ts';

export const IDLE_PLAYBACK: AnimationPlaybackState = {
  phase: 'idle',
  visiblePoints: 0,
  trainingActive: false,
};

export const IDLE_PLAYBACK_ACTIONS: AnimationPlaybackActions = {
  skip: () => {},
  train: async () => {},
  replay: () => {},
};
