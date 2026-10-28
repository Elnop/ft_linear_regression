import type { Sample, Thetas } from './types.ts';

// Min-max scaling: maps [min, max] to [0, 1].
export type Scale = { min: number; max: number };

export function computeScale(values: number[]): Scale {
  if (values.length === 0) throw new Error('cannot compute a scale on an empty set');
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) throw new Error('cannot normalize: all mileages are identical');
  return { min, max };
}

export function normalizeSamples(data: Sample[], scale: Scale): Sample[] {
  const range = scale.max - scale.min;
  return data.map(({ km, price }) => ({ km: (km - scale.min) / range, price }));
}

// Converts thetas learned on normalized mileage back to raw mileage.
//   price = θ0n + θ1n * (km - min) / range
//         = (θ0n - θ1n * min / range) + (θ1n / range) * km
export function denormalizeThetas(thetas: Thetas, scale: Scale): Thetas {
  const range = scale.max - scale.min;
  return {
    theta0: thetas.theta0 - (thetas.theta1 * scale.min) / range,
    theta1: thetas.theta1 / range,
  };
}
