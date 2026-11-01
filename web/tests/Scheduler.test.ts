import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { Scheduler } from '@/features/graffiti/shared/lib/Scheduler.ts';
import type { Job } from '@/features/graffiti/shared/types/SprayTypes.ts';

const layer = () => new PaintLayer({ color: '#ff2bd6', bounds: { x: 0, y: 0, width: 8, height: 8 } }, { at: () => 0.5 });

function job(owner: PaintLayer, seconds: number): Job & { elapsed: number } {
  return {
    layer: owner,
    position: { x: 0, y: 0 },
    elapsed: 0,
    update(deltaSeconds) {
      this.elapsed += deltaSeconds;
      return this.elapsed >= seconds;
    },
  };
}

const settled = async (promise: Promise<void>) => {
  let done = false;
  void promise.then(() => (done = true));
  await new Promise((resolve) => setImmediate(resolve));
  return done;
};

test('a job advances once per tick and settles when it ends', async () => {
  const scheduler = new Scheduler();
  const running = job(layer(), 0.25);
  const promise = scheduler.run(running);
  scheduler.advanceJobs(0.1);
  assert.equal(running.elapsed, 0.1);
  assert.equal(await settled(promise), false);
  scheduler.advanceJobs(0.2);
  assert.equal(await settled(promise), true);
  assert.equal(scheduler.busy, false);
});

test('the current job is the last one started', () => {
  const scheduler = new Scheduler();
  const first = job(layer(), 1);
  const second = job(layer(), 1);
  void scheduler.run(first);
  void scheduler.run(second);
  assert.equal(scheduler.currentJob, second);
  assert.equal(scheduler.jobCount, 2);
});

test('a tween eases to its target and settles', async () => {
  const scheduler = new Scheduler();
  const target = layer();
  target.opacity = 0;
  const promise = scheduler.fade(target, { opacity: 1, gray: 0.5 }, 0.4);
  assert.equal(scheduler.advanceTweens(0.2), true);
  assert.ok(target.opacity > 0 && target.opacity < 1);
  scheduler.advanceTweens(0.3);
  assert.equal(target.opacity, 1);
  assert.equal(target.gray, 0.5);
  assert.equal(await settled(promise), true);
  assert.equal(scheduler.advanceTweens(0.1), false);
});

test('a new fade on the same layer settles the previous one', async () => {
  const scheduler = new Scheduler();
  const target = layer();
  const first = scheduler.fade(target, { opacity: 0, gray: 0 }, 1);
  void scheduler.fade(target, { opacity: 1, gray: 0 }, 1);
  assert.equal(await settled(first), true);
  scheduler.cancelFade(target);
  assert.equal(scheduler.busy, false);
});

test('keepOnly drops the work of the other layers and settles it', async () => {
  const scheduler = new Scheduler();
  const kept = layer();
  const dropped = layer();
  const keptJob = scheduler.run(job(kept, 1));
  const droppedJob = scheduler.run(job(dropped, 1));
  const droppedTween = scheduler.fade(dropped, { opacity: 0, gray: 0 }, 1);
  scheduler.keepOnly((owner) => owner === kept);
  assert.equal(await settled(droppedJob), true);
  assert.equal(await settled(droppedTween), true);
  assert.equal(await settled(keptJob), false);
  assert.equal(scheduler.jobCount, 1);
});
