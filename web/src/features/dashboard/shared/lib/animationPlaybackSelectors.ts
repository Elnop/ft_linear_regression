import type { AnimationPlaybackState } from '@/states/animation-playback/AnimationPlaybackTypes.ts';

export function selectIntro(state: AnimationPlaybackState) {
  return state.phase !== 'interactive';
}

export function selectInterfaceVisible(state: AnimationPlaybackState) {
  return state.phase !== 'idle';
}

export function selectCanSkip(state: AnimationPlaybackState) {
  return selectInterfaceVisible(state) && (selectIntro(state) || state.trainingActive);
}
