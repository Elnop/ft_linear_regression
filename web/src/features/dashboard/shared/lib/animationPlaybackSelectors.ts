import type { AnimationPlaybackState } from '@/states/animation-playback/types/AnimationPlaybackTypes.ts';

export const selectIntro = (state: AnimationPlaybackState) => state.phase !== 'interactive';

export const selectInterfaceVisible = (state: AnimationPlaybackState) => state.phase !== 'idle';

export const selectCanSkip = (state: AnimationPlaybackState) => selectIntro(state) && selectInterfaceVisible(state);
