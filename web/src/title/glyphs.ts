import type { Vec2 } from '../paint/index.ts';

export type Glyph = {
  advance: number;
  strokes: Vec2[][];
  dot?: Vec2;
};

const p = (...xy: number[]): Vec2[] => {
  const out: Vec2[] = [];
  for (let i = 0; i < xy.length; i += 2) out.push({ x: xy[i], y: xy[i + 1] });
  return out;
};

const BOWL = p(0.7, -0.78, 0.46, -1, 0.14, -0.86, 0, -0.46, 0.12, -0.06, 0.42, 0.02, 0.68, -0.3);

export const GLYPHS: Record<string, Glyph> = {
  f: {
    advance: 0.62,
    strokes: [p(0.68, -1.42, 0.5, -1.62, 0.28, -1.5, 0.2, -1.05, 0.19, -0.45, 0.17, 0.05), p(-0.02, -0.92, 0.3, -0.98, 0.58, -1.02)],
  },
  t: {
    advance: 0.66,
    strokes: [p(0.22, -1.48, 0.2, -0.7, 0.22, -0.16, 0.38, 0.02, 0.6, -0.08), p(-0.02, -0.92, 0.3, -0.98, 0.62, -1.04)],
  },
  _: {
    advance: 0.92,
    strokes: [p(-0.02, 0.26, 0.4, 0.24, 0.86, 0.2)],
  },
  l: {
    advance: 0.42,
    strokes: [p(0.12, -1.68, 0.08, -1, 0.06, -0.3, 0.14, 0, 0.32, -0.06)],
  },
  i: {
    advance: 0.36,
    strokes: [p(0.1, -0.98, 0.07, -0.5, 0.08, 0.02)],
    dot: { x: 0.14, y: -1.42 },
  },
  n: {
    advance: 0.9,
    strokes: [p(0.04, -1.02, 0.03, -0.5, 0.04, 0.03), p(0.06, -0.62, 0.24, -0.94, 0.5, -1, 0.68, -0.8, 0.7, -0.4, 0.72, 0.03)],
  },
  e: {
    advance: 0.86,
    strokes: [p(0.04, -0.5, 0.4, -0.52, 0.72, -0.58, 0.64, -0.88, 0.4, -1, 0.12, -0.86, 0, -0.46, 0.12, -0.08, 0.42, 0.02, 0.72, -0.14)],
  },
  a: {
    advance: 0.96,
    strokes: [BOWL, p(0.74, -1.04, 0.72, -0.5, 0.74, -0.1, 0.9, 0.02)],
  },
  r: {
    advance: 0.72,
    strokes: [p(0.04, -1.02, 0.03, -0.5, 0.04, 0.03), p(0.06, -0.58, 0.22, -0.9, 0.44, -1.02, 0.66, -0.92)],
  },
  g: {
    advance: 0.94,
    strokes: [BOWL, p(0.74, -1.04, 0.74, -0.4, 0.7, 0.3, 0.46, 0.58, 0.16, 0.54, 0.02, 0.36)],
  },
  s: {
    advance: 0.8,
    strokes: [p(0.66, -0.88, 0.42, -1.01, 0.14, -0.92, 0.1, -0.66, 0.36, -0.5, 0.62, -0.34, 0.66, -0.1, 0.42, 0.03, 0.12, -0.01, -0.02, -0.16)],
  },
  o: {
    advance: 0.86,
    strokes: [p(0.5, -1, 0.16, -0.88, 0, -0.46, 0.14, -0.06, 0.44, 0.03, 0.72, -0.28, 0.74, -0.7, 0.54, -0.98, 0.3, -0.96)],
  },
};

export function smoothStroke(knots: Vec2[], perSpan = 8): Vec2[] {
  if (knots.length < 3) return knots;
  const out: Vec2[] = [];
  const at = (i: number) => knots[Math.max(0, Math.min(knots.length - 1, i))];
  for (let i = 0; i < knots.length - 1; i++) {
    const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < perSpan; k++) {
      const t = k / perSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (p0: number, p1: number, p2: number, p3: number) =>
        0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
      out.push({ x: f(a.x, b.x, c.x, d.x), y: f(a.y, b.y, c.y, d.y) });
    }
  }
  out.push(knots[knots.length - 1]);
  return out;
}
