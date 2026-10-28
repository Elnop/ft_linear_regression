// Reads a km,price CSV, runs trainSteps to completion, writes model.json.
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { trainSteps } from '../core/train.ts';
import type { TrainStep } from '../core/types.ts';
import { fail, loadDataset, MODEL_PATH } from './model.ts';

const USAGE = `Usage: npm run train -- [dataset.csv] [--lr <rate>] [--iterations <n>]

  dataset.csv       km,price CSV file (default: data.csv)
  --lr <rate>       learning rate, > 0 (default: 0.5)
  --iterations <n>  number of gradient descent steps (default: 10000)
  -h, --help        show this help`;

function parseCli() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        lr: { type: 'string', default: '0.5' },
        iterations: { type: 'string', default: '10000' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (e) {
    fail(`${(e as Error).message}\n\n${USAGE}`);
  }
}

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

const { values, positionals } = parseCli();
if (values.help) {
  console.log(USAGE);
  process.exit(0);
}
if (positionals.length > 1) fail(`expected at most one dataset file\n\n${USAGE}`);

const datasetPath = positionals[0] ?? 'data.csv';
const learningRate = parseLearningRate(values.lr);
const iterations = parseIterations(values.iterations);
const data = loadDataset(datasetPath);

console.log(`Dataset: ${datasetPath} (${data.length} samples)`);
console.log(`Training: lr=${learningRate}, iterations=${iterations}`);

let last: TrainStep | undefined;
try {
  for (const step of trainSteps(data, { learningRate, iterations })) last = step;
} catch (e) {
  fail((e as Error).message);
}

if (!last || !Number.isFinite(last.theta0) || !Number.isFinite(last.theta1)) {
  fail(`training diverged at iteration ${last?.iter ?? 0}, model not saved (try a smaller --lr)`);
}

console.log(
  `Done: theta0=${last.theta0}  theta1=${last.theta1}  cost=${last.cost.toFixed(2)}`,
);

try {
  writeFileSync(MODEL_PATH, JSON.stringify({ theta0: last.theta0, theta1: last.theta1 }, null, 2) + '\n');
} catch (e) {
  fail(`cannot write model: ${(e as NodeJS.ErrnoException).code ?? (e as Error).message}`);
}
console.log('Saved to model.json');
