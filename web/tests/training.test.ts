import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseDataset } from '@core/parseDataset.ts';
import { isFinalPass, runTraining, stepAt } from '@/features/graffiti/features/animation-director/lib/training.ts';

const data = parseDataset(readFileSync(new URL('../../data.csv', import.meta.url), 'utf8'));

test('paints iterations 0, 1, 2, 4… then the last one', () => {
  const plan = runTraining(data, { learningRate: 0.5, iterations: 10000 });
  assert.deepEqual(
    plan.steps.map((step) => step.iteration),
    [0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 10000],
  );
  assert.equal(plan.diverged, false);
  assert.ok(isFinalPass(plan, plan.steps.length - 1));
  assert.ok(!isFinalPass(plan, 0));
});

test('keeps a cost history sorted by iteration that ends on the last one', () => {
  const { history } = runTraining(data, { learningRate: 0.5, iterations: 10000 });
  assert.ok(history.every((point, i) => i === 0 || point.iteration > history[i - 1].iteration));
  assert.equal(history.at(-1)?.iteration, 10000);
});

test('flags a divergent run and keeps only finite steps', () => {
  const plan = runTraining(data, { learningRate: 3, iterations: 10000 });
  assert.equal(plan.diverged, true);
  assert.ok(plan.steps.every((step) => Number.isFinite(step.cost)));
  assert.ok(!isFinalPass(plan, plan.steps.length - 1));
});

test('a snapshot only carries the history up to its pass', () => {
  const plan = runTraining(data, { learningRate: 0.5, iterations: 10000 });
  const snapshot = stepAt(data, plan, 3);
  assert.equal(snapshot.iteration, 4);
  assert.ok(snapshot.history.every((point) => point.iteration <= 4));
});
