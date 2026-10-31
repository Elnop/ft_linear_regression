import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { Overlay } from '@/features/dashboard/shared/types/DashboardTypes.ts';

type Playground = { km: string; overlay: Overlay };

const playgroundStore = createStore<Playground>()(() => ({ km: '100000', overlay: 'wall' }));

export const setKm = (km: string) => playgroundStore.setState({ km });
export const toggleOverlay = (overlay: Overlay) => playgroundStore.setState((state) => ({ overlay: state.overlay === overlay ? 'wall' : overlay }));

export const usePlayground = <T,>(selector: (state: Playground) => T): T => useStore(playgroundStore, selector);
