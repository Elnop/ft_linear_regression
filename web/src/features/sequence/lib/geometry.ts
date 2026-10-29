import type { Thetas } from '@core/types.ts';
import type { ChartMapping } from '@/lib/chart.ts';
import type { Rect, Vec2 } from '@/lib/paint/types.ts';
import { isFinite2, priceAt } from './training.ts';

export function clipSegment(a: Vec2, b: Vec2, r: Rect): [Vec2, Vec2] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, a.x - r.x],
    [dx, r.x + r.w - a.x],
    [-dy, a.y - r.y],
    [dy, r.y + r.h - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return null;
  }
  const at = (t: number) => ({ x: a.x + dx * t, y: a.y + dy * t });
  return [at(t0), at(t1)];
}

export function lineSegment(t: Thetas, chart: ChartMapping, clip: Rect): [Vec2, Vec2] | null {
  if (!isFinite2(t)) return null;
  const { kmMin, kmMax } = chart.domain;
  const a = chart.point(kmMin, priceAt(t, kmMin));
  const b = chart.point(kmMax, priceAt(t, kmMax));
  if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return null;
  const seg = clipSegment(a, b, clip);
  if (!seg || Math.hypot(seg[1].x - seg[0].x, seg[1].y - seg[0].y) < 4) return null;
  return seg;
}
