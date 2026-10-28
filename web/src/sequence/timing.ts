export const TIMING = {
  uiIn: 600,
  dot: 55,
  dotGap: 30,
  redot: 40,
  redotGap: 15,
  beforeDescent: 400,
  fade: 400,
  accel: 3,
  skipScale: 10,

  fanOut: 500,
  pass: [650, 200],
  afterPass: [220, 60],
  finalPass: 1800,
} as const;

export const STYLE = {
  dot: { width: 15, load: [1.8, 2.7] },
  line: { width: 10, thickness: 0.95, hesitations: 0, dwell: 30 },
  finalLine: { width: 15, thickness: 1.8, hesitations: 2, dwell: 70 },
  diverge: { width: 11, thickness: 1.1, hesitations: 0, dwell: 40 },
  fadeBase: 0.8,
  fadeFloor: 0.22,
} as const;

export const COLORS = { point: '#00f0ff', line: '#ff2bd6', diverge: '#e6ff00' } as const;

export function eased(range: readonly [number, number], k: number): number {
  const e = 1 - (1 - Math.min(1, Math.max(0, k))) ** TIMING.accel;
  return range[0] + (range[1] - range[0]) * e;
}

export function fadeGray(age: number): number {
  return age <= 0 ? 0 : 1;
}

export function fadeOpacity(age: number): number {
  return age <= 0 ? 1 : STYLE.fadeFloor + (1 - STYLE.fadeFloor) * STYLE.fadeBase ** age;
}
