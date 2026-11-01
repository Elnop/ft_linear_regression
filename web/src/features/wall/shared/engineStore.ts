import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { PaintEngine } from '@/features/wall/shared/lib/PaintEngine.ts';

const engineStore = createStore<{ engine: PaintEngine | null }>()(() => ({ engine: null }));

export const publishEngine = (engine: PaintEngine | null) => engineStore.setState({ engine });

export const useEngine = () => useStore(engineStore, (state) => state.engine);
