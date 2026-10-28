import type { Thetas, TrainOptions } from '../../../core/types.ts';
import type { ChartMapping, PaintEngine } from '../paint/index.ts';

export type { Thetas, TrainOptions };

// title: the tag is being painted; ui-in: the panels fade in; points: the
// data is sprayed; descent: the gradient descent passes; interactive: intro done.
export type Phase = 'idle' | 'title' | 'ui-in' | 'points' | 'descent' | 'interactive';

export type Metrics = { r2: number; rmse: number; mae: number };

export type CostPoint = { iter: number; cost: number };

export type Prediction = { price: number; x: number; y: number };

export type TitleContext = {
  // Current speed-up of the sequence (1, or TIMING.skipScale after skip/resize).
  timeScale(): number;
  // Aborted when the sequence restarts (resize, unmount): stop painting.
  signal: AbortSignal;
};

// Paints the title on the wall; resolves when done.
export type DrawTitle = (engine: PaintEngine, ctx: TitleContext) => Promise<void>;

export type SequenceOptions = {
  drawTitle?: DrawTitle; // default: the tag from title/index.ts
};

export type SequenceState = {
  phase: Phase;
  visiblePoints: number;
  totalPoints: number;
  thetas: Thetas | null; // latest painted line
  iteration: number | null; // iteration of that line within its training
  metrics: Metrics | null; // on the visible points (all points once interactive)
  costHistory: CostPoint[]; // sampled cost curve of the latest training, up to `iteration`
  diverged: boolean;
  divergedAt: number | null; // first iteration with a non-finite (or growing) cost
  trainingActive: boolean;
  skipping: boolean;
  trainOptions: TrainOptions; // options of the latest training
  chart: ChartMapping | null; // current plot area in wall pixels
};

export type SequenceActions = {
  // Fast-forwards the running intro or training to its final state.
  skip(): void;
  // Retrains on all points and paints the passes. Ignored before the intro ends.
  // Rejects on invalid options (non-positive rate, bad iteration count).
  train(options?: Partial<TrainOptions>): Promise<void>;
  // Clears the wall and plays the intro again.
  replay(): void;
  // Price with the latest line, and its position on the wall; null before any line.
  predict(km: number): Prediction | null;
};

export type Sequence = SequenceState & SequenceActions;
