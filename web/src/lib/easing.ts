// Hermite ease from 0 to 1, flat at both ends; clamps outside [0, 1].
export function smoothstep(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value * value * (3 - 2 * value);
}
