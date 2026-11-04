import { useStore } from 'zustand';
import { predictionStore } from '@/features/dashboard/shared/stores/predictionStore.ts';

export function useKm(): string {
  return useStore(predictionStore, (state) => state.km);
}
