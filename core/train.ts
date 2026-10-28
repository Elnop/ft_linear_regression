import { gradientStep } from './gradient.ts';
import { cost } from './metrics.ts';
import { computeScale, denormalizeThetas, normalizeSamples } from './normalize.ts';
import type { Sample, Thetas, TrainOptions, TrainStep } from './types.ts';

// Yields the state after each iteration, thetas expressed on raw mileage.
// The CLI drains it to the last step; the web consumes it frame by frame.
// Iteration 0 is the initial state (θ0 = θ1 = 0). Stops early if training diverges.
// Mileage is always min-max normalized for the descent (see docs/algorithme.md § 4).
export function* trainSteps(data: Sample[], options: TrainOptions): Generator<TrainStep> {
  const { learningRate, iterations } = options;
  if (data.length === 0) throw new Error('cannot train on an empty dataset');
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new Error('learning rate must be a positive number');
  }
  if (!Number.isInteger(iterations) || iterations < 0) {
    throw new Error('iterations must be a non-negative integer');
  }

  const scale = computeScale(data.map((s) => s.km));
  const trainingData = normalizeSamples(data, scale);

  let thetas: Thetas = { theta0: 0, theta1: 0 };
  for (let iter = 0; iter <= iterations; iter++) {
    if (iter > 0) thetas = gradientStep(trainingData, thetas, learningRate);
    const raw = denormalizeThetas(thetas, scale);
    yield { iter, ...raw, cost: cost(data, raw) };
    if (!Number.isFinite(raw.theta0) || !Number.isFinite(raw.theta1)) return;
  }
}
