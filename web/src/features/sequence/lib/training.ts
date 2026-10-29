import raw from '@dataset?raw';
import { parseDataset } from '@core/csv.ts';
import { estimatePrice } from '@core/hypothesis.ts';
import { mae, r2, rmse } from '@core/metrics.ts';
import { trainSteps } from '@core/train.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from '@core/types.ts';
import type { CostPoint, Metrics } from '@/features/sequence/types.ts';

export const DATA: Sample[] = parseDataset(raw);

export const DEFAULT_TRAIN: TrainOptions = { learningRate: 0.5, iterations: 10000 };

export function metricsOf(data: Sample[], t: Thetas): Metrics {
  return { r2: r2(data, t), rmse: rmse(data, t), mae: mae(data, t) };
}

export function isFinite2(t: Thetas): boolean {
  return Number.isFinite(t.theta0) && Number.isFinite(t.theta1);
}

function sampled(iter: number, next: number): boolean {
  return iter <= 64 || iter >= next;
}

export type Training = {
  steps: TrainStep[];
  history: CostPoint[];
  last: TrainStep;
  diverged: boolean;
  divergedAt: number | null;
};

export function runTraining(data: Sample[], o: TrainOptions, passes: boolean): Training {
  const steps: TrainStep[] = [];
  const history: CostPoint[] = [];
  let last: TrainStep | null = null;
  let first = Infinity;
  let growing: number | null = null;
  let nonFinite: number | null = null;
  let nextPass = 0;
  let nextSample = 0;

  for (const step of trainSteps(data, o)) {
    if (!isFinite2(step)) {
      nonFinite = step.iter;
      break;
    }
    if (step.iter === 0) first = step.cost;
    else if (growing === null && step.cost > first) growing = step.iter;
    if (sampled(step.iter, nextSample) && Number.isFinite(step.cost)) {
      history.push({ iter: step.iter, cost: step.cost });
      nextSample = Math.ceil(step.iter * 1.05);
    }
    if (passes && step.iter === nextPass) {
      steps.push(step);
      nextPass = Math.max(1, nextPass * 2);
    }
    last = step;
  }
  if (!last) throw new Error('training produced no step');
  if (Number.isFinite(last.cost) && history[history.length - 1].iter !== last.iter) history.push({ iter: last.iter, cost: last.cost });
  if (steps[steps.length - 1]?.iter !== last.iter) steps.push(last);

  const diverged = nonFinite !== null || last.cost > first;
  return { steps, history, last, diverged, divergedAt: nonFinite ?? (diverged ? growing : null) };
}

export function priceAt(t: Thetas, km: number): number {
  return estimatePrice(t, km);
}

export type Step = { thetas: Thetas; iter: number; metrics: Metrics; history: CostPoint[] };

export function stepAt(plan: Training, j: number): Step {
  const s = plan.steps[j];
  return {
    thetas: s,
    iter: s.iter,
    metrics: metricsOf(DATA, s),
    history: plan.history.filter((h) => h.iter <= s.iter),
  };
}

export type LineKind = 'line' | 'finalLine' | 'diverge';

export function isFinalPass(plan: Training, j: number): boolean {
  return j === plan.steps.length - 1 && !plan.diverged;
}

export function lineKindAt(plan: Training, j: number): LineKind {
  if (plan.diverged) return 'diverge';
  return isFinalPass(plan, j) ? 'finalLine' : 'line';
}
