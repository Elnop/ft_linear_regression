import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { hasDiverged } from '../core/hasDiverged.ts';
import { parseDataset } from '../core/parseDataset.ts';
import { trainSteps } from '../core/trainSteps.ts';
import type { TrainOptions, TrainStep } from '../core/types/CoreTypes.ts';

const data = parseDataset(readFileSync(new URL('../data.csv', import.meta.url), 'utf8'));

function lastStep(options: TrainOptions): TrainStep {
  let last: TrainStep | undefined;
  for (const step of trainSteps(data, options)) last = step;
  assert.ok(last);
  return last;
}

test('starts from zero thetas', () => {
  const [first] = trainSteps(data, { learningRate: 0.5, iterations: 0 });
  assert.equal(first.iteration, 0);
  assert.equal(first.theta0, 0);
  assert.equal(first.theta1, 0);
});

test('converges to the least squares line of data.csv', () => {
  const last = lastStep({ learningRate: 0.5, iterations: 10000 });
  assert.equal(last.iteration, 10000);
  assert.ok(Math.abs(last.theta0 - 8499.599649933207) < 1e-6);
  assert.ok(Math.abs(last.theta1 + 0.02144896359170222) < 1e-12);
  assert.ok(!hasDiverged(last));
});

test('the cost never rises with a small learning rate', () => {
  let previous = Infinity;
  for (const step of trainSteps(data, { learningRate: 0.5, iterations: 200 })) {
    assert.ok(step.cost <= previous);
    previous = step.cost;
  }
});

test('stops as soon as the cost overflows, before the thetas do', () => {
  const last = lastStep({ learningRate: 1.8, iterations: 10000 });
  assert.equal(last.iteration, 7739);
  assert.ok(Number.isFinite(last.theta0) && Number.isFinite(last.theta1));
  assert.ok(hasDiverged(last));
});

test('diverges at iteration 392 with a learning rate of 3', () => {
  assert.equal(lastStep({ learningRate: 3, iterations: 10000 }).iteration, 392);
});

test('rejects invalid options', () => {
  assert.throws(() => lastStep({ learningRate: 0, iterations: 10 }), /learning rate/);
  assert.throws(() => lastStep({ learningRate: Infinity, iterations: 10 }), /learning rate/);
  assert.throws(() => lastStep({ learningRate: 0.5, iterations: 1.5 }), /iterations/);
  assert.throws(() => lastStep({ learningRate: 0.5, iterations: -1 }), /iterations/);
  assert.throws(() => [...trainSteps([], { learningRate: 0.5, iterations: 1 })], /empty dataset/);
});
