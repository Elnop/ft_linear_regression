import { useStore } from 'zustand';
import { animationPlaybackStore } from '@/states/animation-playback/animationPlaybackStore.ts';
import type { AnimationPlayback } from '@/states/animation-playback/AnimationPlaybackTypes.ts';

export function useAnimationPlayback<T>(selector: (state: AnimationPlayback) => T): T {
  return useStore(animationPlaybackStore, selector);
}
