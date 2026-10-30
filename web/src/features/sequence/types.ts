import type { Thetas, TrainOptions } from '@core/types.ts';

export type Phase = 'idle' | 'title' | 'descent' | 'interactive';

export type Metrics = { r2: number; rmse: number; mae: number };

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
  skipping: boolean;
  trainOptions: TrainOptions;
};

export type SequenceActions = {
  skip: () => void;
  train: (options?: Partial<TrainOptions>) => Promise<void>;
  replay: () => void;
};

export type Sequence = SequenceState & SequenceActions;
