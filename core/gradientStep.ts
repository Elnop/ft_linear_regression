import { estimatePrice } from './estimatePrice.ts';
import type { Sample, Thetas } from './types/CoreTypes.ts';

export function gradientStep(data: Sample[], thetas: Thetas, learningRate: number): Thetas {
  const m = data.length;
  let sumError = 0;
  let sumErrorKm = 0;

  for (const { km, price } of data) {
    const error = estimatePrice(thetas, km) - price;
    sumError += error;
    sumErrorKm += error * km;
  }

  const tmpTheta0 = learningRate * (1 / m) * sumError;
  const tmpTheta1 = learningRate * (1 / m) * sumErrorKm;

  return {
    theta0: thetas.theta0 - tmpTheta0,
    theta1: thetas.theta1 - tmpTheta1,
  };
}
