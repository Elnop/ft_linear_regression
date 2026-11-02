import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { hasDiverged } from '../core/hasDiverged.ts';
import { maxStableLearningRate } from '../core/maxStableLearningRate.ts';
import { parseDataset } from '../core/parseDataset.ts';
import { trainSteps } from '../core/trainSteps.ts';
import type { TrainStep } from '../core/types/CoreTypes.ts';

const data = parseDataset(readFileSync(new URL('../data.csv', import.meta.url), 'utf8'));
const bound = maxStableLearningRate(data);

function run(learningRate: number): TrainStep[] {
  return [...trainSteps(data, { learningRate, iterations: 10000 })];
}

test('the stability bound of data.csv is about 1.76', () => {
  assert.ok(Math.abs(bound - 1.75993) < 1e-4);
});

test('just below the bound the training converges', () => {
  const steps = run(bound * 0.99);
  const [first] = steps;
  const last = steps.at(-1);
  assert.ok(first && last);
  assert.equal(last.iteration, 10000);
  assert.ok(!hasDiverged(last));
  assert.ok(last.cost < first.cost);
});

test('just above the bound the cost keeps growing', () => {
  const steps = run(bound * 1.01);
  const [first] = steps;
  const last = steps.at(-1);
  assert.ok(first && last);
  assert.ok(last.cost > first.cost * 1e100);
});
