export const TIMING = {
  interfaceIn: 700,
  pointsIn: 600,
  dot: 110,
  redot: 70,
  redotGap: 150,
  beforeDescent: 800,
  fade: 400,
  skipScale: 10,

  fanOut: 500,
  pass: 950,
  afterPass: 300,
  finalPass: 2600,
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

export function fadeGray(age: number): number {
  return age <= 0 ? 0 : 1;
}

export function fadeOpacity(age: number): number {
  return age <= 0 ? 1 : STYLE.fadeFloor + (1 - STYLE.fadeFloor) * STYLE.fadeBase ** age;
}
