import { maxStableLearningRate } from '@core/maxStableLearningRate.ts';
import { DATA } from '@/states/regression/configs/DatasetConfig.ts';

const DIVERGENCE_LEARNING_RATE = maxStableLearningRate(DATA);

export function willDiverge(learningRate: number) {
  return learningRate >= DIVERGENCE_LEARNING_RATE;
}
