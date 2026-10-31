import { useStore } from 'zustand';
import { animationPlaybackStore } from '@/states/animation-playback/stores/animationPlaybackStore.ts';
import type { AnimationPlayback } from '@/states/animation-playback/types/AnimationPlaybackTypes.ts';

export const useAnimationPlayback = <T,>(selector: (state: AnimationPlayback) => T): T => useStore(animationPlaybackStore, selector);
