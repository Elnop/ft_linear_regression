import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { DEFAULT_TRAIN } from '@/features/sequence/lib/training.ts';

// What the visitor types: written only through the actions below.
type Playground = { km: string; learningRate: number };

const playgroundStore = createStore<Playground>()(() => ({ km: '100000', learningRate: DEFAULT_TRAIN.learningRate }));

export const setKm = (km: string) => playgroundStore.setState({ km });
export const setLearningRate = (learningRate: number) => playgroundStore.setState({ learningRate });

export const usePlayground = <T,>(selector: (s: Playground) => T): T => useStore(playgroundStore, selector);
