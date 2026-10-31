import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

const predictionStore = createStore<{ km: string }>()(() => ({ km: '100000' }));

export const setKm = (km: string) => predictionStore.setState({ km });

export const useKm = (): string => useStore(predictionStore, (state) => state.km);
