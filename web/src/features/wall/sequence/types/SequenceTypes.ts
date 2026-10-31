import type { CostPoint, Metrics, Sample, Thetas, TrainOptions, TrainStep } from '@core/types/CoreTypes.ts';

type Phase = 'idle' | 'title' | 'descent' | 'interactive';

export type SequenceState = {
  phase: Phase;
  visiblePoints: number;
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

export type ModelReporter = {
  reset: () => void;
  show: (step: SequenceStep) => void;
  restart: () => void;
  finish: (diverged: boolean) => void;
};

export type SequenceDependencies = {
  samples: Sample[];
  defaults: TrainOptions;
  model: ModelReporter;
};

export type Clock = { readonly instant: boolean };
