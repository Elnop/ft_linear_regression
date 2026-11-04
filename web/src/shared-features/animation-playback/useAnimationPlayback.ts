import { useStore } from 'zustand';
import { animationPlaybackStore } from '@/shared-features/animation-playback/animationPlaybackStore.ts';
import type { AnimationPlayback } from '@/shared-features/animation-playback/AnimationPlaybackTypes.ts';

export function useAnimationPlayback<T>(selector: (state: AnimationPlayback) => T): T {
  return useStore(animationPlaybackStore, selector);
}
