import { expect, test } from 'vitest';
import { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { Scheduler } from '@/features/graffiti/shared/lib/Scheduler.ts';
import type { Job } from '@/features/graffiti/shared/types/SprayTypes.ts';

function layer() {
  return new PaintLayer({ color: '#ff2bd6', bounds: { x: 0, y: 0, width: 8, height: 8 } }, { at: () => 0.5 });
}

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

async function settled(promise: Promise<void>) {
  let done = false;
  void promise.then(() => (done = true));
  await new Promise((resolve) => setImmediate(resolve));
  return done;
}

test('a job advances once per tick and settles when it ends', async () => {
  const scheduler = new Scheduler();
  const running = job(layer(), 0.25);
  const promise = scheduler.run(running);
  scheduler.advanceJobs(0.1);
  expect(running.elapsed).toBe(0.1);
  expect(await settled(promise)).toBe(false);
  scheduler.advanceJobs(0.2);
  expect(await settled(promise)).toBe(true);
  expect(scheduler.busy).toBe(false);
});

test('the current job is the last one started', () => {
  const scheduler = new Scheduler();
  const first = job(layer(), 1);
  const second = job(layer(), 1);
  void scheduler.run(first);
  void scheduler.run(second);
  expect(scheduler.currentJob).toBe(second);
  expect(scheduler.jobCount).toBe(2);
});

test('a tween eases to its target and settles', async () => {
  const scheduler = new Scheduler();
  const target = layer();
  target.opacity = 0;
  const promise = scheduler.fade(target, { opacity: 1, gray: 0.5 }, 0.4);
  expect(scheduler.advanceTweens(0.2)).toBe(true);
  expect(target.opacity > 0 && target.opacity < 1).toBe(true);
  scheduler.advanceTweens(0.3);
  expect(target.opacity).toBe(1);
  expect(target.gray).toBe(0.5);
  expect(await settled(promise)).toBe(true);
  expect(scheduler.advanceTweens(0.1)).toBe(false);
});

test('a new fade on the same layer settles the previous one', async () => {
  const scheduler = new Scheduler();
  const target = layer();
  const first = scheduler.fade(target, { opacity: 0, gray: 0 }, 1);
  void scheduler.fade(target, { opacity: 1, gray: 0 }, 1);
  expect(await settled(first)).toBe(true);
  scheduler.cancelFade(target);
  expect(scheduler.busy).toBe(false);
});

test('keepOnly drops the work of the other layers and settles it', async () => {
  const scheduler = new Scheduler();
  const kept = layer();
  const dropped = layer();
  const keptJob = scheduler.run(job(kept, 1));
  const droppedJob = scheduler.run(job(dropped, 1));
  const droppedTween = scheduler.fade(dropped, { opacity: 0, gray: 0 }, 1);
  scheduler.keepOnly((owner) => owner === kept);
  expect(await settled(droppedJob)).toBe(true);
  expect(await settled(droppedTween)).toBe(true);
  expect(await settled(keptJob)).toBe(false);
  expect(scheduler.jobCount).toBe(1);
});
