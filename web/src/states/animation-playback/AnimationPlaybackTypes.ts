import type { TrainOptions } from '@core/types/CoreTypes.ts';

type Phase = 'idle' | 'title' | 'descent' | 'interactive';

export type AnimationPlaybackState = {
  phase: Phase;
  visiblePoints: number;
  trainingActive: boolean;
};

export type AnimationPlaybackActions = {
  skip: () => void;
  train: (options?: Partial<TrainOptions>) => Promise<void>;
  replay: () => void;
};

export type AnimationPlayback = AnimationPlaybackState & AnimationPlaybackActions;
