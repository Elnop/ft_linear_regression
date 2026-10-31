import { hasFiniteThetas } from '@core/hasFiniteThetas.ts';
import type { SequenceState } from '@/features/wall/sequence/types/SequenceTypes.ts';

export const selectIntro = (state: SequenceState) => state.phase !== 'interactive';

export const selectInterfaceVisible = (state: SequenceState) => state.phase !== 'idle';

export const selectCanSkip = (state: SequenceState) => selectIntro(state) && selectInterfaceVisible(state);

export const selectUsableThetas = (state: SequenceState) =>
  state.thetas && !state.diverged && hasFiniteThetas(state.thetas) ? state.thetas : null;
