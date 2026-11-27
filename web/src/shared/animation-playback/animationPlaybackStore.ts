import { createStore } from 'zustand/vanilla';
import {
  IDLE_PLAYBACK_ACTIONS,
  IDLE_PLAYBACK,
} from '@/shared/animation-playback/AnimationPlaybackStateConfig.ts';
import type { AnimationPlayback } from '@/shared/animation-playback/AnimationPlaybackTypes.ts';

export const animationPlaybackStore = createStore<AnimationPlayback>()(() => ({
  ...IDLE_PLAYBACK,
  ...IDLE_PLAYBACK_ACTIONS,
}));
