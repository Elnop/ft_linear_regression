import type { CostPoint, Metrics, Sample, Thetas } from '@core/types/CoreTypes.ts';

export type ModelState = {
  samples: Sample[];
  thetas: Thetas | null;
  iteration: number | null;
  metrics: Metrics | null;
  costHistory: CostPoint[];
  diverged: boolean;
};

export type ModelSnapshot = { thetas: Thetas; iteration: number; metrics: Metrics; history: CostPoint[] };

export type TrainingOptionsState = {
  learningRate: number;
  willDiverge: boolean;
  setLearningRate: (learningRate: number) => void;
};
