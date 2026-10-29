import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { PaintEngine } from './engine.ts';

// Written only by PaintWall, which owns the engine's lifetime.
const engineStore = createStore<{ engine: PaintEngine | null }>()(() => ({ engine: null }));

export const publishEngine = (engine: PaintEngine | null) => engineStore.setState({ engine });

export const useEngine = () => useStore(engineStore, (s) => s.engine);
