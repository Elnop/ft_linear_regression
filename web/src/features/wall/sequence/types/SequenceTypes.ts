import type { Thetas, TrainOptions, TrainStep } from '@core/types/CoreTypes.ts';

type Phase = 'idle' | 'title' | 'descent' | 'interactive';

type Metrics = { r2: number; rmse: number; mae: number };

export type CostPoint = { iteration: number; cost: number };

export type SequenceState = {
  phase: Phase;
  visiblePoints: number;
  thetas: Thetas | null;
  iteration: number | null;
  metrics: Metrics | null;
  costHistory: CostPoint[];
  diverged: boolean;
  trainingActive: boolean;
};

export type SequenceActions = {
  skip: () => void;
  train: (options?: Partial<TrainOptions>) => Promise<void>;
  replay: () => void;
};

export type Sequence = SequenceState & SequenceActions;

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

export type SequenceStep = { thetas: Thetas; iteration: number; metrics: Metrics; history: CostPoint[] };

export type Clock = { readonly instant: boolean };
