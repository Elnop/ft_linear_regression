import { useStore } from 'zustand';
import { animationPlaybackStore } from '@/states/animation-playback/animationPlaybackStore.ts';
import type { AnimationPlayback } from '@/states/animation-playback/AnimationPlaybackTypes.ts';

export const useAnimationPlayback = <T,>(selector: (state: AnimationPlayback) => T): T => useStore(animationPlaybackStore, selector);
