import { useStore } from 'zustand';
import { sceneStore } from '@/shared/sceneStore.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

export function useScene(): Scene {
  return useStore(sceneStore, (state) => state);
}
