import type { Thetas, TrainOptions } from '../../../core/types.ts';
import type { ChartMapping, PaintEngine } from '../paint/index.ts';

export type { Thetas, TrainOptions };

export type Phase = 'idle' | 'title' | 'descent' | 'interactive';

export type Metrics = { r2: number; rmse: number; mae: number };

export type CostPoint = { iter: number; cost: number };

export type Prediction = { price: number; x: number; y: number };

export type TitleContext = {
  timeScale(): number;
  signal: AbortSignal;
};

export type DrawTitle = (engine: PaintEngine, ctx: TitleContext) => Promise<void>;

export type SequenceOptions = {
  drawTitle?: DrawTitle;
};

export type SequenceState = {
  phase: Phase;
  visiblePoints: number;
  totalPoints: number;
  thetas: Thetas | null;
  iteration: number | null;
  metrics: Metrics | null;
  costHistory: CostPoint[];
  diverged: boolean;
  divergedAt: number | null;
  trainingActive: boolean;
  skipping: boolean;
  trainOptions: TrainOptions;
  chart: ChartMapping | null;
};

export type SequenceActions = {
  skip(): void;
  train(options?: Partial<TrainOptions>): Promise<void>;
  replay(): void;
  predict(km: number): Prediction | null;
};

export type Sequence = SequenceState & SequenceActions;
