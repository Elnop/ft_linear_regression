import { mulberry32 } from '@/shared/lib/random.ts';
import type { Corner } from '@/features/wall/stickers/StickersTypes.ts';

const toPoints = (points: number[][]) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export function peelGeometry(width: number, height: number, [corner, fraction]: [Corner, number]) {
  const size = fraction * Math.min(width, height);
  const cuts: Record<Corner, { index: number; bevel: number[][]; triangle: number[][]; matrix: string }> = {
    topLeft: { index: 0, bevel: [[0, size], [size, 0]], triangle: [[0, 0], [size, 0], [0, size]], matrix: `0 -1 -1 0 ${size} ${size}` },
    topRight: { index: 1, bevel: [[width - size, 0], [width, size]], triangle: [[width - size, 0], [width, 0], [width, size]], matrix: `0 1 1 0 ${width - size} ${size - width}` },
    bottomRight: { index: 2, bevel: [[width, height - size], [width - size, height]], triangle: [[width, height - size], [width, height], [width - size, height]], matrix: `0 -1 -1 0 ${width + height - size} ${width + height - size}` },
    bottomLeft: { index: 3, bevel: [[size, height], [0, height - size]], triangle: [[size, height], [0, height], [0, height - size]], matrix: `0 1 1 0 ${size - height} ${height - size}` },
  };
  const cut = cuts[corner];
  const keep = [[0, 0], [width, 0], [width, height], [0, height]].flatMap((point, i) => (i === cut.index ? cut.bevel : [point]));
  return { keep: toPoints(keep), cut: toPoints(cut.triangle), matrix: `matrix(${cut.matrix})` };
}

export function tornEdge(width: number, height: number, x: number, seed: number, inset = 0) {
  const random = mulberry32(seed);
  const segmentCount = 14;
  const slant = (random() - 0.5) * 0.25 * width;
  const edge: number[][] = [];
  for (let i = 0; i <= segmentCount; i++) {
    const progress = i / segmentCount;
    edge.push([x + slant * (progress - 0.5) + (random() - 0.5) * 0.06 * width + inset, progress * height]);
  }
  return toPoints([[-1, -1], ...edge.map(([edgeX, edgeY], i) => [edgeX, i === 0 ? -1 : i === segmentCount ? height + 1 : edgeY]), [-1, height + 1]]);
}
