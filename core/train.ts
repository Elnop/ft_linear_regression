import { gradientStep } from './gradientStep.ts';
import { cost } from './metrics.ts';
import { computeScale, denormalizeThetas, normalizeSamples } from './normalize.ts';
import { hasFiniteThetas } from './hasFiniteThetas.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from './CoreTypes.ts';

export function* trainSteps(data: Sample[], options: TrainOptions): Generator<TrainStep> {
  const { learningRate, iterations } = options;
  if (data.length === 0) throw new Error('cannot train on an empty dataset');
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new Error('learning rate must be a positive number');
  }
  if (!Number.isInteger(iterations) || iterations < 0) {
    throw new Error('iterations must be a non-negative integer');
  }

  const scale = computeScale(data.map((sample) => sample.km));
  const trainingData = normalizeSamples(data, scale);

  let thetas: Thetas = { theta0: 0, theta1: 0 };
  for (let iteration = 0; iteration <= iterations; iteration++) {
    if (iteration > 0) thetas = gradientStep(trainingData, thetas, learningRate);
    const raw = denormalizeThetas(thetas, scale);
    yield { iteration, ...raw, cost: cost(data, raw) };
    if (!hasFiniteThetas(raw)) return;
  }
}
