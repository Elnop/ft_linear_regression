import raw from '@dataset?raw';
import { parseDataset } from '@core/csv.ts';
import { mae, r2, rmse } from '@core/metrics.ts';
import { trainSteps } from '@core/train.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from '@core/types.ts';
import type { CostPoint, Metrics } from '@/features/sequence/types.ts';

export const DATA: Sample[] = parseDataset(raw);

export const DEFAULT_TRAIN: TrainOptions = { learningRate: 0.5, iterations: 10000 };

export const willDiverge = (learningRate: number) => learningRate > 1.75;

export function hasFiniteThetas(thetas: Thetas): boolean {
  return Number.isFinite(thetas.theta0) && Number.isFinite(thetas.theta1);
}

export type Training = {
  steps: TrainStep[];
  history: CostPoint[];
  last: TrainStep;
  diverged: boolean;
};

export function runTraining(data: Sample[], options: TrainOptions): Training {
  const steps: TrainStep[] = [];
  const history: CostPoint[] = [];
  let last: TrainStep | null = null;
  let first = Infinity;
  let nonFinite = false;
  let nextPass = 0;
  let nextSample = 0;

  for (const step of trainSteps(data, options)) {
    if (!hasFiniteThetas(step)) {
      nonFinite = true;
      break;
    }
    if (step.iteration === 0) first = step.cost;
    if ((step.iteration <= 64 || step.iteration >= nextSample) && Number.isFinite(step.cost)) {
      history.push({ iteration: step.iteration, cost: step.cost });
      nextSample = Math.ceil(step.iteration * 1.05);
    }
    if (step.iteration === nextPass) {
      steps.push(step);
      nextPass = Math.max(1, nextPass * 2);
    }
    last = step;
  }
  if (!last) throw new Error('training produced no step');
  if (Number.isFinite(last.cost) && history[history.length - 1].iteration !== last.iteration) history.push({ iteration: last.iteration, cost: last.cost });
  if (steps[steps.length - 1]?.iteration !== last.iteration) steps.push(last);

  const diverged = nonFinite || last.cost > first;
  return { steps, history, last, diverged };
}

export type Step = { thetas: Thetas; iteration: number; metrics: Metrics; history: CostPoint[] };

export function stepAt(plan: Training, pass: number): Step {
  const step = plan.steps[pass];
  return {
    thetas: step,
    iteration: step.iteration,
    metrics: { r2: r2(DATA, step), rmse: rmse(DATA, step), mae: mae(DATA, step) },
    history: plan.history.filter((point) => point.iteration <= step.iteration),
  };
}

export type LineKind = 'line' | 'finalLine' | 'diverge';

export function isFinalPass(plan: Training, pass: number): boolean {
  return pass === plan.steps.length - 1 && !plan.diverged;
}

export function lineKindAt(plan: Training, pass: number): LineKind {
  if (plan.diverged) return 'diverge';
  return isFinalPass(plan, pass) ? 'finalLine' : 'line';
}
