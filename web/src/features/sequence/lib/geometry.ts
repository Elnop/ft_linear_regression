import { estimatePrice } from '@core/hypothesis.ts';
import type { Thetas } from '@core/types.ts';
import type { ChartMapping } from '@/lib/chart.ts';
import type { Rectangle, Vec2 } from '@/lib/paint/types.ts';
import { hasFiniteThetas } from './training.ts';

function clipSegment(start: Vec2, end: Vec2, rectangle: Rectangle): [Vec2, Vec2] | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let entry = 0;
  let exit = 1;
  const edges: [number, number][] = [
    [-dx, start.x - rectangle.x],
    [dx, rectangle.x + rectangle.width - start.x],
    [-dy, start.y - rectangle.y],
    [dy, rectangle.y + rectangle.height - start.y],
  ];
  for (const [direction, distance] of edges) {
    if (direction === 0) {
      if (distance < 0) return null;
      continue;
    }
    const ratio = distance / direction;
    if (direction < 0) entry = Math.max(entry, ratio);
    else exit = Math.min(exit, ratio);
    if (entry > exit) return null;
  }
  const at = (ratio: number) => ({ x: start.x + dx * ratio, y: start.y + dy * ratio });
  return [at(entry), at(exit)];
}

export function lineSegment(thetas: Thetas, chart: ChartMapping, clip: Rectangle): [Vec2, Vec2] | null {
  if (!hasFiniteThetas(thetas)) return null;
  const { kmMin, kmMax } = chart.domain;
  const start = chart.point(kmMin, estimatePrice(thetas, kmMin));
  const end = chart.point(kmMax, estimatePrice(thetas, kmMax));
  if (![start.x, start.y, end.x, end.y].every(Number.isFinite)) return null;
  const segment = clipSegment(start, end, clip);
  if (!segment || Math.hypot(segment[1].x - segment[0].x, segment[1].y - segment[0].y) < 4) return null;
  return segment;
}
