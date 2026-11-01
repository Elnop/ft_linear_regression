import type { TrainOptions } from '@core/types/CoreTypes.ts';
import type { StoreApi } from 'zustand/vanilla';
import type { AnimationPlayback } from '@/states/animation-playback/AnimationPlaybackTypes.ts';
import { DATA } from '@/states/regression/configs/DatasetConfig.ts';
import { DEFAULT_TRAIN } from '@/states/regression/configs/TrainingConfig.ts';
import { regressionActions } from '@/states/regression/stores/regressionStore.ts';
import { runTraining, stepAt } from './training.ts';

function showTrainedModel(options: TrainOptions): void {
  const plan = runTraining(DATA, options);
  regressionActions.restart();
  regressionActions.show(stepAt(DATA, plan, plan.steps.length - 1));
  regressionActions.finish(plan.diverged);
}

export function playWithoutPaint(store: StoreApi<AnimationPlayback>): void {
  showTrainedModel(DEFAULT_TRAIN);
  store.setState({
    phase: 'interactive',
    visiblePoints: DATA.length,
    trainingActive: false,
    skip: () => {},
    replay: () => showTrainedModel(DEFAULT_TRAIN),
    train: (overrides = {}) => {
      showTrainedModel({ ...DEFAULT_TRAIN, ...overrides });
      return Promise.resolve();
    },
  });
}
