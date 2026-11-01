import { maxStableLearningRate } from '@core/maxStableLearningRate.ts';
import { DATA } from '@/states/regression/configs/DatasetConfig.ts';

const DIVERGENCE_LEARNING_RATE = maxStableLearningRate(DATA);

export const willDiverge = (learningRate: number) => learningRate >= DIVERGENCE_LEARNING_RATE;
