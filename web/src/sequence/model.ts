import raw from '../../../data.csv?raw';
import { parseDataset } from '../../../core/csv.ts';
import { estimatePrice } from '../../../core/hypothesis.ts';
import { mae, r2, rmse } from '../../../core/metrics.ts';
import { trainSteps } from '../../../core/train.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from '../../../core/types.ts';
import type { ChartMapping, Rect, Vec2 } from '../paint/index.ts';
import type { CostPoint, Metrics } from './types.ts';

export const DATA: Sample[] = parseDataset(raw);

// Same defaults as `npm run train`, so the final line is model.json.
export const DEFAULT_TRAIN: TrainOptions = { learningRate: 0.5, iterations: 10000 };

export function metricsOf(data: Sample[], t: Thetas): Metrics {
  return { r2: r2(data, t), rmse: rmse(data, t), mae: mae(data, t) };
}

export function isFinite2(t: Thetas): boolean {
  return Number.isFinite(t.theta0) && Number.isFinite(t.theta1);
}

export function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Iterations kept for the cost sparkline: every one up to 64, then ~5% apart.
function sampled(iter: number, next: number): boolean {
  return iter <= 64 || iter >= next;
}

export type Training = {
  steps: TrainStep[]; // painted passes (log-spaced), or just the last step
  history: CostPoint[];
  last: TrainStep; // last finite step
  diverged: boolean;
  divergedAt: number | null;
};

// Runs gradient descent to the end. `passes` keeps iterations 0, 1, 2, 4, 8, …
// and the last finite one; otherwise only the last step is kept.
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
    // Same stop as the CLI: θ itself is no longer a number (the cost overflows earlier).
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

// Liang–Barsky: the part of segment a→b inside `r`, or null.
export function clipSegment(a: Vec2, b: Vec2, r: Rect): [Vec2, Vec2] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, a.x - r.x],
    [dx, r.x + r.w - a.x],
    [-dy, a.y - r.y],
    [dy, r.y + r.h - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return null;
  }
  const at = (t: number) => ({ x: a.x + dx * t, y: a.y + dy * t });
  return [at(t0), at(t1)];
}

// The line across the full km domain, clipped to the plot or to the wall.
export function lineSegment(t: Thetas, chart: ChartMapping, clip: Rect): [Vec2, Vec2] | null {
  if (!isFinite2(t)) return null;
  const { kmMin, kmMax } = chart.domain;
  const a = chart.point(kmMin, priceAt(t, kmMin));
  const b = chart.point(kmMax, priceAt(t, kmMax));
  if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return null;
  const seg = clipSegment(a, b, clip);
  if (!seg || Math.hypot(seg[1].x - seg[0].x, seg[1].y - seg[0].y) < 4) return null;
  return seg;
}
