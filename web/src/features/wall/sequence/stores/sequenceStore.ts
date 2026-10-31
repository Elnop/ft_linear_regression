import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { IDLE_STATE } from '@/features/wall/sequence/lib/state.ts';
import type { Sequence, SequenceActions } from '@/features/wall/sequence/SequenceTypes.ts';

export const IDLE_ACTIONS: SequenceActions = {
  skip: () => {},
  train: async () => {},
  replay: () => {},
};

export const sequenceStore = createStore<Sequence>()(() => ({ ...IDLE_STATE, ...IDLE_ACTIONS }));

export const useSequence = <T,>(selector: (state: Sequence) => T): T => useStore(sequenceStore, selector);
