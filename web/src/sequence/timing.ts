// Every duration of the sequence, in ms at normal speed. `[first, last]`
// pairs are interpolated along the passes with an ease-out, so the descent
// starts slow and accelerates. After the title: ≈ 11 s.
export const TIMING = {
  uiIn: 600, // after the title, while the panels fade in
  dot: 55, // spraying one point (24 of them: ≈ 2 s with the gaps)
  dotGap: 30,
  redot: 40, // re-spraying one point over the finished lines
  redotGap: 15,
  beforeDescent: 400, // the data alone on the wall, before the first pass
  fade: 400, // older lines fading
  accel: 3, // ease-out exponent of the interpolation
  skipScale: 10, // speed-up applied by skip() and by a resize repaint

  // Gradient descent passes (intro and train()).
  fanOut: 500, // previous fan fading out (train() only)
  pass: [650, 200], // painting an intermediate pass
  afterPass: [220, 60],
  finalPass: 1800,
} as const;

// Paint weight of the strokes: thickness ≈ 1 is opaque, ≳ 1.5 starts to run.
export const STYLE = {
  dot: { width: 15, load: [1.8, 2.7] },
  line: { width: 10, thickness: 0.95, hesitations: 0, dwell: 30 },
  finalLine: { width: 15, thickness: 1.8, hesitations: 2, dwell: 70 },
  diverge: { width: 11, thickness: 1.1, hesitations: 0, dwell: 40 },
  fadeBase: 0.8, // opacity of a line = fadeFloor + (1 - fadeFloor) * fadeBase ** age
  fadeFloor: 0.22, // old lines fade but never vanish: the fan stays readable
} as const;

export const COLORS = { point: '#00f0ff', line: '#ff2bd6', diverge: '#e6ff00' } as const;

export function eased(range: readonly [number, number], k: number): number {
  const e = 1 - (1 - Math.min(1, Math.max(0, k))) ** TIMING.accel;
  return range[0] + (range[1] - range[0]) * e;
}

// Grey level of a line: fully grey as soon as a newer line is painted.
export function fadeGray(age: number): number {
  return age <= 0 ? 0 : 1; // only the newest line keeps its colour
}

export function fadeOpacity(age: number): number {
  return age <= 0 ? 1 : STYLE.fadeFloor + (1 - STYLE.fadeFloor) * STYLE.fadeBase ** age;
}
