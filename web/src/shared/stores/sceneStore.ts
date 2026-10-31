import { createStore } from 'zustand/vanilla';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

const read = (): Scene => sceneFor(window.innerWidth, window.innerHeight);

export const sceneStore = createStore<Scene>()(read);
window.addEventListener('resize', () => sceneStore.setState(read(), true));
