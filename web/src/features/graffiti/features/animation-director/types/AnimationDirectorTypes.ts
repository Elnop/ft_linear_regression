import type { CostPoint, Sample, TrainStep } from '@core/types/CoreTypes.ts';
import type { StoreApi } from 'zustand/vanilla';
import type { AnimationPlayback } from '@/states/animation-playback/AnimationPlaybackTypes.ts';
import type { RegressionActions } from '@/states/regression/RegressionTypes.ts';
import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import type { Slicer } from '@/features/graffiti/shared/lib/Slicer.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

export type Run = {
  readonly instant: boolean;
  readonly signal: AbortSignal;
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
  reducedMotion: boolean;
};

export type SceneSource = Pick<StoreApi<Scene>, 'getState' | 'subscribe'>;

export type Director = {
  start: () => void;
  destroy: () => void;
};

export type FinalWallRecipe = {
  samples: Sample[];
  plan: Training;
  order: number[];
  withTitle: boolean;
};

export type FanLayers = { fan: PaintLayer[]; topPoints: PaintLayer[] };

export type FinalWall = {
  layers: PaintLayer[];
  title: PaintLayer | null;
  fanLayers: FanLayers;
};

export type Build = {
  plan: Training;
  slicer: Slicer;
  width: number;
  height: number;
  rem: number;
  wall: Promise<FinalWall | null>;
};
