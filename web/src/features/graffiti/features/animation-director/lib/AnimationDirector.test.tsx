import { afterEach, expect, test, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { AnimationDirector } from '@/features/graffiti/features/animation-director/lib/AnimationDirector.ts';
import { wallRegions } from '@/features/graffiti/features/animation-director/lib/wallRegions.ts';
import { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import type { AnimationPlayback } from '@/shared-features/animation-playback/AnimationPlaybackTypes.ts';
import { IDLE_PLAYBACK, IDLE_PLAYBACK_ACTIONS } from '@/shared-features/animation-playback/AnimationPlaybackStateConfig.ts';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  document.documentElement.style.fontSize = '';
});

function setup() {
  const container = document.createElement('div');
  document.body.append(container);
  const engine = new PaintEngine(container, PIXEL);
  engine.ready.catch(() => {});
  const reanchor = vi.spyOn(engine, 'reanchor');
  const playback = createStore<AnimationPlayback>()(() => ({ ...IDLE_PLAYBACK, ...IDLE_PLAYBACK_ACTIONS }));
  const regression = { reset: () => {}, restart: () => {}, show: () => {}, finish: () => {} };
  const scene = createStore<Scene>()(() => sceneFor(engine.width, engine.height, 16));
  const director = new AnimationDirector(engine, { playback, regression, samples: [], reducedMotion: false }, scene);
  cleanups.push(() => {
    director.destroy();
    engine.destroy();
    container.remove();
  });
  return { engine, reanchor, scene, director };
}

test('a root font size change re-anchors the wall to the new regions', () => {
  const { engine, reanchor, scene } = setup();
  const before = wallRegions(engine.width, engine.height);
  document.documentElement.style.fontSize = '20px';
  scene.setState(sceneFor(engine.width, engine.height, 20), true);
  const after = wallRegions(engine.width, engine.height);
  expect(after).not.toStrictEqual(before);
  expect(reanchor.mock.calls).toStrictEqual([[after]]);
});

test('a scene change that keeps rem does not re-anchor, and destroy stops listening', () => {
  const { engine, reanchor, scene, director } = setup();
  scene.setState(sceneFor(engine.width, engine.height, 16), true);
  expect(reanchor).not.toHaveBeenCalled();
  director.destroy();
  scene.setState(sceneFor(engine.width, engine.height, 20), true);
  expect(reanchor).not.toHaveBeenCalled();
});
