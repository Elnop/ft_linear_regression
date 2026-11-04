import raw from '@dataset?raw';
import { expect, test } from 'vitest';
import { parseDataset } from '@core/parseDataset.ts';
import { isFinalPass, runTraining, stepAt } from '@/features/graffiti/features/animation-director/lib/training.ts';

const data = parseDataset(raw);

test('paints iterations 0, 1, 2, 4… then the last one', () => {
  const plan = runTraining(data, { learningRate: 0.5, iterations: 10000 });
  expect(plan.steps.map((step) => step.iteration)).toStrictEqual([0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 10000]);
  expect(plan.diverged).toBe(false);
  expect(isFinalPass(plan, plan.steps.length - 1)).toBe(true);
  expect(!isFinalPass(plan, 0)).toBe(true);
});

test('keeps a cost history sorted by iteration that ends on the last one', () => {
  const { history } = runTraining(data, { learningRate: 0.5, iterations: 10000 });
  expect(history.every((point, i) => i === 0 || point.iteration > history[i - 1].iteration)).toBe(true);
  expect(history.at(-1)?.iteration).toBe(10000);
});

test('flags a divergent run and keeps only finite steps', () => {
  const plan = runTraining(data, { learningRate: 3, iterations: 10000 });
  expect(plan.diverged).toBe(true);
  expect(plan.steps.every((step) => Number.isFinite(step.cost))).toBe(true);
  expect(!isFinalPass(plan, plan.steps.length - 1)).toBe(true);
});

test('a snapshot only carries the history up to its pass', () => {
  const plan = runTraining(data, { learningRate: 0.5, iterations: 10000 });
  const snapshot = stepAt(data, plan, 3);
  expect(snapshot.iteration).toBe(4);
  expect(snapshot.history.every((point) => point.iteration <= 4)).toBe(true);
});
