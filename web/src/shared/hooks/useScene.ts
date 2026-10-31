import { useStore } from 'zustand';
import { sceneStore } from '@/shared/stores/sceneStore.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

export const useScene = (): Scene => useStore(sceneStore, (state) => state);
