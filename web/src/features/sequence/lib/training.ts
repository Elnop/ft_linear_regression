import { mae, r2, rmse } from '@core/metrics.ts';
import { hasFiniteThetas } from '@core/thetas.ts';
import { trainSteps } from '@core/train.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from '@core/types.ts';
import type { CostPoint, Metrics } from '@/features/sequence/types.ts';

export const DEFAULT_TRAIN: TrainOptions = { learningRate: 0.5, iterations: 10000 };

const DIVERGENCE_LEARNING_RATE = 1.75;

export const willDiverge = (learningRate: number) => learningRate > DIVERGENCE_LEARNING_RATE;

export type Training = {
  steps: TrainStep[];
  history: CostPoint[];
  last: TrainStep;
  diverged: boolean;
};

const DENSE_HISTORY_UNTIL = 64;
const nextHistorySample = (iteration: number) => Math.ceil(iteration * 1.05);

const nextPass = (iteration: number) => Math.max(1, iteration * 2);

export function runTraining(data: Sample[], options: TrainOptions): Training {
  const steps: TrainStep[] = [];
  const history: CostPoint[] = [];
  let last: TrainStep | null = null;
  let firstCost = Infinity;
  let nonFinite = false;
  let passAt = 0;
  let sampleAt = 0;

  for (const step of trainSteps(data, options)) {
    if (!hasFiniteThetas(step)) {
      nonFinite = true;
      break;
    }
    if (step.iteration === 0) firstCost = step.cost;
    if ((step.iteration <= DENSE_HISTORY_UNTIL || step.iteration >= sampleAt) && Number.isFinite(step.cost)) {
      history.push({ iteration: step.iteration, cost: step.cost });
      sampleAt = nextHistorySample(step.iteration);
    }
    if (step.iteration === passAt) {
      steps.push(step);
      passAt = nextPass(passAt);
    }
    last = step;
  }
  if (!last) throw new Error('training produced no step');
  if (Number.isFinite(last.cost) && history.at(-1)?.iteration !== last.iteration) history.push({ iteration: last.iteration, cost: last.cost });
  if (steps.at(-1)?.iteration !== last.iteration) steps.push(last);

  const diverged = nonFinite || last.cost > firstCost;
  return { steps, history, last, diverged };
}

export type Step = { thetas: Thetas; iteration: number; metrics: Metrics; history: CostPoint[] };

export function stepAt(data: Sample[], plan: Training, pass: number): Step {
  const step = plan.steps[pass];
  return {
    thetas: step,
    iteration: step.iteration,
    metrics: { r2: r2(data, step), rmse: rmse(data, step), mae: mae(data, step) },
    history: plan.history.filter((point) => point.iteration <= step.iteration),
  };
}

export function isFinalPass(plan: Training, pass: number): boolean {
  return pass === plan.steps.length - 1 && !plan.diverged;
}
