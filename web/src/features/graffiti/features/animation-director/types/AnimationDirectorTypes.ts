import type { CostPoint, Sample, TrainStep } from '@core/types/CoreTypes.ts';
import type { StoreApi } from 'zustand/vanilla';
import type { AnimationPlayback } from '@/states/animation-playback/AnimationPlaybackTypes.ts';
import type { RegressionActions } from '@/states/regression/RegressionTypes.ts';

export type Run = {
  readonly instant: boolean;
  sleep: (duration: number) => Promise<void>;
  wait: <T>(promise: Promise<T>) => Promise<T>;
};

export type LineKind = 'line' | 'finalLine' | 'diverge';

export type Training = {
  steps: TrainStep[];
  history: CostPoint[];
  diverged: boolean;
};

export type DirectorDependencies = {
  playback: StoreApi<AnimationPlayback>;
  regression: RegressionActions;
  samples: Sample[];
};

export type Director = {
  start: () => void;
  destroy: () => void;
};
