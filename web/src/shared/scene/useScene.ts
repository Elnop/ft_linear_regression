import { useStore } from 'zustand';
import { sceneStore } from '@/shared/scene/sceneStore.ts';
import type { Scene } from '@/shared/scene/types/SceneTypes.ts';

export function useScene(): Scene {
  return useStore(sceneStore, (state) => state);
}
