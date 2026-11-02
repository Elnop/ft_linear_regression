import { createStore } from 'zustand/vanilla';

export const predictionStore = createStore<{ km: string }>()(() => ({ km: '100000' }));

export const predictionActions = {
  setKm: (km: string) => predictionStore.setState({ km }),
};
