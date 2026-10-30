import { hasFiniteThetas } from '../core/thetas.ts';
import { trainSteps } from '../core/train.ts';
import type { TrainStep } from '../core/types.ts';
import { parseCli } from './args.ts';
import { loadDataset } from './dataset.ts';
import { writeModel } from './model.ts';
import { fail } from './process.ts';

const USAGE = `Usage: npm run train -- [dataset.csv] [--lr <rate>] [--iterations <n>]

  dataset.csv       km,price CSV file (default: data.csv)
  --lr <rate>       learning rate, > 0 (default: 0.5)
  --iterations <n>  number of gradient descent steps (default: 10000)
  -h, --help        show this help`;

function parseLearningRate(text: string): number {
  const value = Number(text);
  if (text.trim() === '' || !Number.isFinite(value) || value <= 0) {
    fail(`--lr must be a positive number, got "${text}"`);
  }
  return value;
}

function parseIterations(text: string): number {
  if (!/^\d+$/.test(text)) fail(`--iterations must be a non-negative integer, got "${text}"`);
  const value = Number(text);
  if (!Number.isSafeInteger(value)) fail(`--iterations is too large: "${text}"`);
  return value;
}

const { values, datasetPath } = parseCli(USAGE, {
  lr: { type: 'string', default: '0.5' },
  iterations: { type: 'string', default: '10000' },
});
const learningRate = parseLearningRate(values.lr);
const iterations = parseIterations(values.iterations);
const data = loadDataset(datasetPath);

console.log(`Dataset: ${datasetPath} (${data.length} samples)`);
console.log(`Training: lr=${learningRate}, iterations=${iterations}`);

let last: TrainStep | undefined;
try {
  for (const step of trainSteps(data, { learningRate, iterations })) last = step;
} catch (error) {
  fail((error as Error).message);
}

if (!last || !hasFiniteThetas(last)) {
  fail(`training diverged at iteration ${last?.iteration ?? 0}, model not saved (try a smaller --lr)`);
}

console.log(
  `Done: theta0=${last.theta0}  theta1=${last.theta1}  cost=${last.cost.toFixed(2)}`,
);

writeModel(last);
console.log('Saved to model.json');
