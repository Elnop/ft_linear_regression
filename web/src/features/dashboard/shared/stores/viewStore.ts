import { createStore } from 'zustand/vanilla';
import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';

export const viewStore = createStore<{ view: View }>()(() => ({ view: 'wall' }));

export const viewActions = {
  toggle: (view: View) => viewStore.setState((state) => ({ view: state.view === view ? 'wall' : view })),
};
