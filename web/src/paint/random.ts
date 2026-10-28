export type Rng = () => number;

// Small seeded PRNG so a given seed always paints the same stroke.
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.random() * 2 ** 32) >>> 0;
}

// Standard normal sample (Box-Muller).
export function gaussian(rng: Rng): number {
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Smooth 1D value noise in [-1, 1], one random knot per unit.
export function noise1D(rng: Rng, knots = 64): (x: number) => number {
  const values = Array.from({ length: knots }, () => rng() * 2 - 1);
  return (x: number) => {
    const f = Math.floor(x);
    const t = x - f;
    const a = values[((f % knots) + knots) % knots];
    const b = values[(((f + 1) % knots) + knots) % knots];
    const s = t * t * (3 - 2 * t);
    return a + (b - a) * s;
  };
}

// Smooth 2D value noise in [0, 1], one random knot per unit.
export function noise2D(seed: number): (x: number, y: number) => number {
  const hash = (i: number, j: number) => {
    let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(seed, 982451653);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  return (x: number, y: number) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    let u = x - i;
    let v = y - j;
    u = u * u * (3 - 2 * u);
    v = v * v * (3 - 2 * v);
    const a = hash(i, j) + (hash(i + 1, j) - hash(i, j)) * u;
    const b = hash(i, j + 1) + (hash(i + 1, j + 1) - hash(i, j + 1)) * u;
    return a + (b - a) * v;
  };
}
