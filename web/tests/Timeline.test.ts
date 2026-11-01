import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Timeline } from '@/features/graffiti/features/animation-director/lib/Timeline.ts';

test('each run carries its own instant mode', () => {
  const timeline = new Timeline();
  const animated = timeline.restart();
  const instant = timeline.restart(true);
  assert.equal(animated.instant, false);
  assert.equal(instant.instant, true);
});

test('the current run waits and sleeps normally', async () => {
  const run = new Timeline().restart();
  assert.equal(await run.wait(Promise.resolve(42)), 42);
  const startedAt = performance.now();
  await run.sleep(60);
  assert.ok(performance.now() - startedAt >= 50);
});

test('an instant run does not sleep', async () => {
  const run = new Timeline().restart(true);
  const startedAt = performance.now();
  await run.sleep(10_000);
  assert.ok(performance.now() - startedAt < 50);
});

test('a restart cancels the previous run, even in the middle of a sleep', async () => {
  const timeline = new Timeline();
  const old = timeline.restart();
  const sleeping = old.sleep(10_000);
  timeline.restart();
  await assert.rejects(sleeping);
  await assert.rejects(old.wait(Promise.resolve()));
});

test('play swallows cancellations and rethrows real errors', async () => {
  const timeline = new Timeline();
  const old = timeline.restart();
  const playing = timeline.play(() => old.sleep(10_000));
  timeline.restart();
  await playing;
  await assert.rejects(
    timeline.play(() => Promise.reject(new Error('boom'))),
    /boom/,
  );
});
