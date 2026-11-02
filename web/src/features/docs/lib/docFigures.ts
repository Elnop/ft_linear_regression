import { DEFAULT_TRAIN } from '@core/configs/TrainingConfig.ts';
import { estimatePrice } from '@core/estimatePrice.ts';
import { mae, mean, r2, rmse } from '@core/metrics.ts';
import { trainSteps } from '@core/trainSteps.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from '@core/types/CoreTypes.ts';
import type { DocFigures } from '@/features/docs/DocsTypes.ts';

const EXAMPLE_MILEAGE = 100_000;
const DIVERGENT_LEARNING_RATE = 3;

function lastStep(samples: Sample[], options: TrainOptions): TrainStep {
  let last: TrainStep | null = null;
  for (const step of trainSteps(samples, options)) last = step;
  if (!last) throw new Error('training produced no step');
  return last;
}

function leastSquares(samples: Sample[]): Thetas {
  const meanKm = mean(samples.map((sample) => sample.km));
  const meanPrice = mean(samples.map((sample) => sample.price));
  const covariance = mean(samples.map((sample) => (sample.km - meanKm) * (sample.price - meanPrice)));
  const variance = mean(samples.map((sample) => (sample.km - meanKm) ** 2));
  const theta1 = covariance / variance;
  return { theta0: meanPrice - theta1 * meanKm, theta1 };
}

export function docFigures(samples: Sample[]): DocFigures {
  const [first, second] = samples;
  if (!first || !second) throw new Error('the docs need at least two samples');
  const kms = samples.map((sample) => sample.km);
  const descent = lastStep(samples, DEFAULT_TRAIN);
  return {
    sampleCount: samples.length,
    firstSamples: [first, second],
    kmMin: Math.min(...kms),
    kmMax: Math.max(...kms),
    meanSquaredKm: mean(kms.map((km) => km * km)),
    learningRate: DEFAULT_TRAIN.learningRate,
    iterations: DEFAULT_TRAIN.iterations,
    descent: { theta0: descent.theta0, theta1: descent.theta1, cost: descent.cost },
    leastSquares: leastSquares(samples),
    r2: r2(samples, descent),
    rmse: rmse(samples, descent),
    mae: mae(samples, descent),
    meanPrice: mean(samples.map((sample) => sample.price)),
    exampleMileage: EXAMPLE_MILEAGE,
    examplePrice: estimatePrice(descent, EXAMPLE_MILEAGE),
    divergentLearningRate: DIVERGENT_LEARNING_RATE,
    divergenceIteration: lastStep(samples, { ...DEFAULT_TRAIN, learningRate: DIVERGENT_LEARNING_RATE }).iteration,
  };
}
