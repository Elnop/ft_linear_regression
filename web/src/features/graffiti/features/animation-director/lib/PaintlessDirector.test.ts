import raw from '@dataset?raw';
import { expect, test } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { parseDataset } from '@core/parseDataset.ts';
import type { RegressionSnapshot } from '@/shared-features/regression/RegressionTypes.ts';
import type { AnimationPlayback } from '@/shared-features/animation-playback/AnimationPlaybackTypes.ts';
import { IDLE_PLAYBACK, IDLE_PLAYBACK_ACTIONS } from '@/shared-features/animation-playback/AnimationPlaybackStateConfig.ts';
import { PaintlessDirector } from '@/features/graffiti/features/animation-director/lib/PaintlessDirector.ts';

const samples = parseDataset(raw);

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
  const director = new PaintlessDirector({ playback, regression, samples, reducedMotion: false });
  return { playback, calls, shown, finished, director };
}

test('starts directly on the trained model, every point visible', () => {
  const { playback, shown, finished, director } = setup();
  director.start();
  expect(playback.getState().phase).toBe('interactive');
  expect(playback.getState().visiblePoints).toBe(samples.length);
  expect(playback.getState().painted).toBe(false);
  expect(shown.at(-1)?.iteration).toBe(10000);
  expect(finished).toStrictEqual([false]);
});

test('train shows the final step of the requested learning rate', async () => {
  const { playback, finished, director } = setup();
  director.start();
  await playback.getState().train({ learningRate: 3 });
  expect(finished).toStrictEqual([false, true]);
});

test('destroy puts both stores back to idle', () => {
  const { playback, calls, director } = setup();
  director.start();
  director.destroy();
  expect(playback.getState().phase).toBe('idle');
  expect(playback.getState().train).toBe(IDLE_PLAYBACK_ACTIONS.train);
  expect(calls.at(-1)).toBe('reset');
});
