import { expect, test } from 'vitest';
import { Timeline } from '@/features/graffiti/features/animation-director/lib/Timeline.ts';

test('each run carries its own instant mode', () => {
  const timeline = new Timeline();
  const animated = timeline.restart();
  const instant = timeline.restart(true);
  expect(animated.instant).toBe(false);
  expect(instant.instant).toBe(true);
});

test('the current run waits and sleeps normally', async () => {
  const run = new Timeline().restart();
  expect(await run.wait(Promise.resolve(42))).toBe(42);
  const startedAt = performance.now();
  await run.sleep(60);
  expect(performance.now() - startedAt >= 50).toBeTruthy();
});

test('an instant run does not sleep', async () => {
  const run = new Timeline().restart(true);
  const startedAt = performance.now();
  await run.sleep(10_000);
  expect(performance.now() - startedAt < 50).toBeTruthy();
});

test('a restart cancels the previous run, even in the middle of a sleep', async () => {
  const timeline = new Timeline();
  const old = timeline.restart();
  const sleeping = old.sleep(10_000);
  timeline.restart();
  await expect(sleeping).rejects.toThrow();
  await expect(old.wait(Promise.resolve())).rejects.toThrow();
});

test('play swallows cancellations and rethrows real errors', async () => {
  const timeline = new Timeline();
  const old = timeline.restart();
  const playing = timeline.play(() => old.sleep(10_000));
  timeline.restart();
  await playing;
  await expect(timeline.play(() => Promise.reject(new Error('boom')))).rejects.toThrow(/boom/);
});
