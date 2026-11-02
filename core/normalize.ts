import type { Sample, Thetas, Scale } from './types/CoreTypes.ts';

export function computeScale(values: number[]): Scale {
  if (values.length === 0) throw new Error('cannot compute a scale on an empty set');
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === max) throw new Error('cannot normalize: all mileages are identical');
  return { min, max };
}

export function normalizeSamples(data: Sample[], scale: Scale): Sample[] {
  const range = scale.max - scale.min;
  return data.map(({ km, price }) => ({ km: (km - scale.min) / range, price }));
}

export function denormalizeThetas(thetas: Thetas, scale: Scale): Thetas {
  const range = scale.max - scale.min;
  return {
    theta0: thetas.theta0 - (thetas.theta1 * scale.min) / range,
    theta1: thetas.theta1 / range,
  };
}
