import { mean } from './metrics.ts';
import { computeScale, normalizeSamples } from './normalize.ts';
import type { Sample } from './types/CoreTypes.ts';

export function maxStableLearningRate(data: Sample[]): number {
  const kms = normalizeSamples(data, computeScale(data.map((sample) => sample.km))).map((sample) => sample.km);
  const meanKm = mean(kms);
  const meanSquaredKm = mean(kms.map((km) => km * km));
  const largestCurvature = (1 + meanSquaredKm + Math.hypot(1 - meanSquaredKm, 2 * meanKm)) / 2;
  return 2 / largestCurvature;
}
