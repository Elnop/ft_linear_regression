import { createStore } from 'zustand/vanilla';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import type { EngineState } from '@/features/graffiti/shared/types/EngineTypes.ts';

export const engineStore = createStore<EngineState>()(() => ({ engine: null, failed: false }));

export const engineActions = {
  publish: (engine: PaintEngine | null) => engineStore.setState({ engine }),
  fail: (error: unknown) => {
    console.error(error);
    engineStore.setState({ engine: null, failed: true });
  },
};
