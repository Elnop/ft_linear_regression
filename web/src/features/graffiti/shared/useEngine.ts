import { useStore } from 'zustand';
import { engineStore } from '@/features/graffiti/shared/engineStore.ts';
import type { EngineState } from '@/features/graffiti/shared/types/EngineTypes.ts';

export const useEngine = <T,>(selector: (state: EngineState) => T): T => useStore(engineStore, selector);
