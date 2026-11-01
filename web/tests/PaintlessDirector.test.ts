import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createStore } from 'zustand/vanilla';
import { parseDataset } from '@core/parseDataset.ts';
import type { RegressionSnapshot } from '@/states/regression/RegressionTypes.ts';
import type { AnimationPlayback } from '@/states/animation-playback/AnimationPlaybackTypes.ts';
import { IDLE_PLAYBACK, IDLE_PLAYBACK_ACTIONS } from '@/states/animation-playback/AnimationPlaybackStateConfig.ts';
import { PaintlessDirector } from '@/features/graffiti/features/animation-director/lib/PaintlessDirector.ts';

const samples = parseDataset(readFileSync(new URL('../../data.csv', import.meta.url), 'utf8'));

function setup() {
  const playback = createStore<AnimationPlayback>()(() => ({ ...IDLE_PLAYBACK, ...IDLE_PLAYBACK_ACTIONS }));
  const calls: string[] = [];
  const shown: RegressionSnapshot[] = [];
  const finished: boolean[] = [];
  const regression = {
    reset: () => calls.push('reset'),
    restart: () => calls.push('restart'),
    show: (snapshot: RegressionSnapshot) => shown.push(snapshot),
    finish: (diverged: boolean) => finished.push(diverged),
  };
  const director = new PaintlessDirector({ playback, regression, samples });
  return { playback, calls, shown, finished, director };
}

test('starts directly on the trained model, every point visible', () => {
  const { playback, shown, finished, director } = setup();
  director.start();
  assert.equal(playback.getState().phase, 'interactive');
  assert.equal(playback.getState().visiblePoints, samples.length);
  assert.equal(shown.at(-1)?.iteration, 10000);
  assert.deepEqual(finished, [false]);
});

test('train shows the final step of the requested learning rate', async () => {
  const { playback, finished, director } = setup();
  director.start();
  await playback.getState().train({ learningRate: 3 });
  assert.deepEqual(finished, [false, true]);
});

test('destroy puts both stores back to idle', () => {
  const { playback, calls, director } = setup();
  director.start();
  director.destroy();
  assert.equal(playback.getState().phase, 'idle');
  assert.equal(playback.getState().train, IDLE_PLAYBACK_ACTIONS.train);
  assert.equal(calls.at(-1), 'reset');
});
