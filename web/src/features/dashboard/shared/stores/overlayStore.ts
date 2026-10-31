import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { Overlay } from '@/features/dashboard/shared/types/DashboardTypes.ts';

const overlayStore = createStore<{ overlay: Overlay }>()(() => ({ overlay: 'wall' }));

export const toggleOverlay = (overlay: Overlay) => overlayStore.setState((state) => ({ overlay: state.overlay === overlay ? 'wall' : overlay }));

export const useOverlay = (): Overlay => useStore(overlayStore, (state) => state.overlay);
