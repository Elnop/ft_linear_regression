import type { SequenceState } from '@/features/sequence/types.ts';

export const selectIntro = (state: SequenceState) => state.phase !== 'interactive';

export const selectInterfaceVisible = (state: SequenceState) => state.phase !== 'idle';

export const selectCanSkip = (state: SequenceState) => selectIntro(state) && selectInterfaceVisible(state);
