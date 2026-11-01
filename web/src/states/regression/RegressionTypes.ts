import type { CostPoint, Metrics, Sample, Thetas } from '@core/types/CoreTypes.ts';

export type RegressionState = {
  samples: Sample[];
  thetas: Thetas | null;
  iteration: number | null;
  metrics: Metrics | null;
  costHistory: CostPoint[];
  diverged: boolean;
};

export type RegressionSnapshot = { thetas: Thetas; iteration: number; metrics: Metrics; history: CostPoint[] };

export type RegressionActions = {
  reset: () => void;
  show: (snapshot: RegressionSnapshot) => void;
  restart: () => void;
  finish: (diverged: boolean) => void;
};

export type TrainingOptionsState = {
  learningRate: number;
  willDiverge: boolean;
  setLearningRate: (learningRate: number) => void;
};
