import type { Vec2 } from '@/shared/types/GeometryTypes.ts';

export function smoothStroke(knots: Vec2[], perSpan = 8): Vec2[] {
  if (knots.length < 3) return knots;
  const out: Vec2[] = [];
  const at = (i: number) => knots[Math.max(0, Math.min(knots.length - 1, i))];
  for (let i = 0; i < knots.length - 1; i++) {
    const [before, start, end, after] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < perSpan; k++) {
      const progress = k / perSpan;
      const squared = progress * progress;
      const cubed = squared * progress;
      const catmullRom = (p0: number, p1: number, p2: number, p3: number) =>
        0.5 * (2 * p1 + (p2 - p0) * progress + (2 * p0 - 5 * p1 + 4 * p2 - p3) * squared + (3 * p1 - p0 - 3 * p2 + p3) * cubed);
      out.push({ x: catmullRom(before.x, start.x, end.x, after.x), y: catmullRom(before.y, start.y, end.y, after.y) });
    }
  }
  out.push(knots[knots.length - 1]);
  return out;
}
