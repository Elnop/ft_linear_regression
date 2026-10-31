import type { StoreApi } from 'zustand/vanilla';
import type { CostPoint, Metrics, Sample, Thetas, TrainOptions } from '@core/types/CoreTypes.ts';

type ReadableStore<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;

export type SequenceView = {
  phase: 'idle' | 'title' | 'descent' | 'interactive';
  visiblePoints: number;
  trainingActive: boolean;
  skip: () => void;
  train: (options?: Partial<TrainOptions>) => Promise<void>;
  replay: () => void;
};

export type ModelView = {
  samples: Sample[];
  thetas: Thetas | null;
  iteration: number | null;
  metrics: Metrics | null;
  costHistory: CostPoint[];
  diverged: boolean;
};

export type TrainingOptionsView = {
  learningRate: number;
  willDiverge: boolean;
  setLearningRate: (learningRate: number) => void;
};

export type DashboardPorts = {
  sequence: ReadableStore<SequenceView>;
  model: ReadableStore<ModelView>;
  trainingOptions: ReadableStore<TrainingOptionsView>;
};
