import { useStore } from 'zustand';
import { engineStore } from '@/features/graffiti/shared/paint-engine/engineStore.ts';
import type { EngineState } from '@/features/graffiti/shared/paint-engine/types/EngineTypes.ts';

export function useEngine<T>(selector: (state: EngineState) => T): T {
  return useStore(engineStore, selector);
}
