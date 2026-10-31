import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { Overlay } from '@/features/dashboard/shared/DashboardTypes.ts';
import { DEFAULT_TRAIN } from '@/features/wall/sequence/lib/training.ts';

type Playground = { km: string; learningRate: number; overlay: Overlay };

const playgroundStore = createStore<Playground>()(() => ({ km: '100000', learningRate: DEFAULT_TRAIN.learningRate, overlay: 'wall' }));

export const setKm = (km: string) => playgroundStore.setState({ km });
export const setLearningRate = (learningRate: number) => playgroundStore.setState({ learningRate });
export const toggleOverlay = (overlay: Overlay) => playgroundStore.setState((state) => ({ overlay: state.overlay === overlay ? 'wall' : overlay }));

export const usePlayground = <T,>(selector: (state: Playground) => T): T => useStore(playgroundStore, selector);
