import type { CostPoint, TrainStep } from '@core/types/CoreTypes.ts';

export type Run = {
  sleep: (duration: number) => Promise<void>;
  wait: <T>(promise: Promise<T>) => Promise<T>;
};

export type LineKind = 'line' | 'finalLine' | 'diverge';

export type Training = {
  steps: TrainStep[];
  history: CostPoint[];
  last: TrainStep;
  diverged: boolean;
};

export type Clock = { readonly instant: boolean };
