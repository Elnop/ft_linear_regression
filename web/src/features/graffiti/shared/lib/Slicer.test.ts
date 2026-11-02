import { expect, test } from 'vitest';
import { Slicer } from '@/features/graffiti/shared/lib/Slicer.ts';

test('a slice runs until its budget is spent, then gives the thread back', async () => {
  const slicer = new Slicer(30, new AbortController().signal);
  await slicer.pause();
  expect(slicer.due).toBe(false);
  let otherTaskRan = false;
  setTimeout(() => (otherTaskRan = true), 0);
  const until = performance.now() + 40;
  while (performance.now() < until);
  expect(slicer.due).toBe(true);
  await slicer.pause();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(otherTaskRan).toBe(true);
});

test('an aborted slicer stops at the next pause', async () => {
  const controller = new AbortController();
  const slicer = new Slicer(1000, controller.signal);
  await slicer.pause();
  controller.abort(new Error('dropped'));
  expect(slicer.stopped).toBe(true);
  await expect(slicer.pause()).rejects.toThrow(/dropped/);
});

test('hurrying only ever widens the slice', async () => {
  const slicer = new Slicer(20, new AbortController().signal);
  slicer.hurry(5);
  await slicer.pause();
  const until = performance.now() + 10;
  while (performance.now() < until);
  expect(slicer.due).toBe(false);
});
