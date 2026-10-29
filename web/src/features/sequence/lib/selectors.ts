import type { SequenceState } from '@/features/sequence/types.ts';

export const selectIntro = (s: SequenceState) => s.phase !== 'interactive';

export const selectUiVisible = (s: SequenceState) => s.phase !== 'idle';

export const selectCanSkip = (s: SequenceState) => selectIntro(s) && selectUiVisible(s) && !s.skipping;
