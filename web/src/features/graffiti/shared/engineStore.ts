import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';

const engineStore = createStore<{ engine: PaintEngine | null; failed: boolean }>()(() => ({ engine: null, failed: false }));

export const publishEngine = (engine: PaintEngine | null) => engineStore.setState({ engine });

export const reportEngineFailure = (error: unknown) => {
  console.error(error);
  engineStore.setState({ engine: null, failed: true });
};

export const useEngine = () => useStore(engineStore, (state) => state.engine);

export const useEngineFailed = () => useStore(engineStore, (state) => state.failed);
