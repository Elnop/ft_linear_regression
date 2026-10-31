import { smoothstep } from '@/shared/lib/easing.ts';

export type RandomGenerator = () => number;

export function mulberry32(seed: number): RandomGenerator {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.random() * 2 ** 32) >>> 0;
}

export function gaussian(random: RandomGenerator): number {
  const radiusSample = 1 - random();
  const angleSample = random();
  return Math.sqrt(-2 * Math.log(radiusSample)) * Math.cos(2 * Math.PI * angleSample);
}

export function noise1D(random: RandomGenerator, knots = 64): (x: number) => number {
  const values = Array.from({ length: knots }, () => random() * 2 - 1);
  return (x: number) => {
    const cell = Math.floor(x);
    const fraction = x - cell;
    const left = values[((cell % knots) + knots) % knots];
    const right = values[(((cell + 1) % knots) + knots) % knots];
    return left + (right - left) * smoothstep(fraction);
  };
}

export function noise2D(seed: number): (x: number, y: number) => number {
  const hash = (i: number, j: number) => {
    let mixed = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(seed, 982451653);
    mixed = Math.imul(mixed ^ (mixed >>> 13), 1274126177);
    return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
  };
  return (x: number, y: number) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const blendX = smoothstep(x - i);
    const blendY = smoothstep(y - j);
    const top = hash(i, j) + (hash(i + 1, j) - hash(i, j)) * blendX;
    const bottom = hash(i, j + 1) + (hash(i + 1, j + 1) - hash(i, j + 1)) * blendX;
    return top + (bottom - top) * blendY;
  };
}

export function shuffled(count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
