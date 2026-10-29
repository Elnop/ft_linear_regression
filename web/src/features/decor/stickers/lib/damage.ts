import { mulberry32 } from '@/lib/random.ts';
import type { Corner } from '@/features/decor/stickers/types.ts';

const pts = (p: number[][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export function peelGeometry(W: number, H: number, [corner, f]: [Corner, number]) {
  const p = f * Math.min(W, H);
  const cuts: Record<Corner, { at: number; pair: number[][]; tri: number[][]; m: string }> = {
    tl: { at: 0, pair: [[0, p], [p, 0]], tri: [[0, 0], [p, 0], [0, p]], m: `0 -1 -1 0 ${p} ${p}` },
    tr: { at: 1, pair: [[W - p, 0], [W, p]], tri: [[W - p, 0], [W, 0], [W, p]], m: `0 1 1 0 ${W - p} ${p - W}` },
    br: { at: 2, pair: [[W, H - p], [W - p, H]], tri: [[W, H - p], [W, H], [W - p, H]], m: `0 -1 -1 0 ${W + H - p} ${W + H - p}` },
    bl: { at: 3, pair: [[p, H], [0, H - p]], tri: [[p, H], [0, H], [0, H - p]], m: `0 1 1 0 ${p - H} ${H - p}` },
  };
  const c = cuts[corner];
  const keep = [[0, 0], [W, 0], [W, H], [0, H]].flatMap((q, i) => (i === c.at ? c.pair : [q]));
  return { keep: pts(keep), cut: pts(c.tri), matrix: `matrix(${c.m})` };
}

export function tornEdge(W: number, H: number, x: number, seed: number, inset = 0) {
  const rng = mulberry32(seed);
  const n = 14;
  const slant = (rng() - 0.5) * 0.25 * W;
  const edge: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    edge.push([x + slant * (t - 0.5) + (rng() - 0.5) * 0.06 * W + inset, t * H]);
  }
  return pts([[-1, -1], ...edge.map(([ex, ey], i) => [ex, i === 0 ? -1 : i === n ? H + 1 : ey]), [-1, H + 1]]);
}
