import type { SequenceView } from '@/features/dashboard/shared/types/PortsTypes.ts';

export const selectIntro = (state: SequenceView) => state.phase !== 'interactive';

export const selectInterfaceVisible = (state: SequenceView) => state.phase !== 'idle';

export const selectCanSkip = (state: SequenceView) => selectIntro(state) && selectInterfaceVisible(state);
