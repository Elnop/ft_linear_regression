import { useStore } from 'zustand';
import { predictionStore } from '@/features/dashboard/shared/stores/predictionStore.ts';

export const useKm = (): string => useStore(predictionStore, (state) => state.km);
