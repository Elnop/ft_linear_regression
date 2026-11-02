import { useStore } from 'zustand';
import { viewStore } from '@/features/dashboard/shared/stores/viewStore.ts';
import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';

export const useView = (): View => useStore(viewStore, (state) => state.view);
