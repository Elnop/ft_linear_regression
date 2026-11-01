import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';

const viewStore = createStore<{ view: View }>()(() => ({ view: 'wall' }));

export const toggleView = (view: View) => viewStore.setState((state) => ({ view: state.view === view ? 'wall' : view }));

export const useView = (): View => useStore(viewStore, (state) => state.view);
