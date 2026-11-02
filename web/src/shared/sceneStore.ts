import { createStore } from 'zustand/vanilla';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

const read = (): Scene => sceneFor(document.documentElement.clientWidth, window.innerHeight);

export const sceneStore = createStore<Scene>()(read);

let frame = 0;
const refresh = () => {
  if (frame !== 0) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const next = read();
    const current = sceneStore.getState();
    if (next.width !== current.width || next.height !== current.height) sceneStore.setState(next, true);
  });
};
window.addEventListener('resize', refresh);
new ResizeObserver(refresh).observe(document.documentElement);
