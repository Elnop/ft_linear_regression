import { createStore } from 'zustand/vanilla';
import { readRem } from '@/shared/lib/readRem.ts';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

function read(): Scene {
  return sceneFor(document.documentElement.clientWidth, window.innerHeight, readRem());
}

export const sceneStore = createStore<Scene>()(read);

let frame = 0;
function refresh() {
  if (frame !== 0) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const next = read();
    const current = sceneStore.getState();
    if (next.width !== current.width || next.height !== current.height || next.rem !== current.rem) sceneStore.setState(next, true);
  });
}

const probe = document.createElement('div');
probe.setAttribute('aria-hidden', 'true');
probe.style.cssText = 'position: absolute; visibility: hidden; height: 1rem';
document.body.append(probe);

window.addEventListener('resize', refresh);
const observer = new ResizeObserver(refresh);
observer.observe(document.documentElement);
observer.observe(probe);
