import { createStore } from 'zustand/vanilla';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

const read = (): Scene => sceneFor(document.documentElement.clientWidth, window.innerHeight);

export const sceneStore = createStore<Scene>()(read);

let frame = 0;
window.addEventListener('resize', () => {
  if (frame !== 0) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    sceneStore.setState(read(), true);
  });
});
