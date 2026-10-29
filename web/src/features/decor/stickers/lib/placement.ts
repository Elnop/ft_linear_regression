import type { ChartMapping } from '@/lib/chart.ts';
import { WIDE } from '@/lib/layout.ts';
import type { Cluster, Damage, Item, PlacedSticker } from '@/features/decor/stickers/types.ts';
import { car, descent, formula, logo42, norm, piscine, react, ts } from './arts.tsx';

const CLUSTERS: Cluster[] = [
  {
    u: 0.03,
    v: 0.62,
    items: [
      { art: logo42, dx: 98, dy: 0, w: 56, rot: 10, dmg: { seed: 3, scrape: 0.63, peel: ['tr', 0.3] } },
      { art: car, dx: 0, dy: 14, w: 80, rot: -8, dmg: { seed: 11, scrape: 0.6 } },
      { art: piscine, dx: 72, dy: 60, w: 96, rot: 4, dmg: { seed: 5, scrape: 0.63, tear: 0.68 } },
      { art: formula, dx: 6, dy: 108, w: 120, rot: -3, dmg: { seed: 9, scrape: 0.62, peel: ['br', 0.3] } },
    ],
  },
  {
    u: 0.74,
    v: 0.04,
    items: [
      { art: ts, dx: 82, dy: 0, w: 52, rot: 8, dmg: { seed: 2, scrape: 0.65 } },
      { art: react, dx: 0, dy: 26, w: 72, rot: -6, dmg: { seed: 8, scrape: 0.63, peel: ['bl', 0.45] } },
      { art: descent, dx: 140, dy: 40, w: 82, rot: -3, dmg: { seed: 14, scrape: 0.61, tear: 0.72 } },
      { art: norm, dx: 58, dy: 78, w: 92, rot: 3, dmg: { seed: 6, scrape: 0.6 } },
    ],
  },
];

const TITLE_DAMAGE: Damage = { seed: 21, scrape: 0.64, peel: ['br', 0.32] };

export function placeStickers(chart: ChartMapping, width: number, titleRight: number): PlacedSticker[] {
  const { area } = chart;
  const k = Math.min(1, Math.max(0.6, width / 1440));
  const items: (Item & { x: number; y: number })[] = [];
  for (const c of CLUSTERS) {
    const right = Math.max(...c.items.map((it) => (it.dx + it.w) * k));
    const ax = Math.min(area.x + c.u * area.w, width - right - 6);
    const ay = area.y + c.v * area.h;
    for (const it of c.items) items.push({ ...it, x: ax + it.dx * k, y: ay + it.dy * k });
  }
  if (width >= WIDE && titleRight + 110 < width - 420) {
    items.push({ art: logo42, dx: 0, dy: 0, w: 50, rot: 15, dmg: TITLE_DAMAGE, x: titleRight + 40, y: Math.max(20, area.y * 0.3) });
  }
  return items.map((s) => ({ art: s.art, dmg: s.dmg, w: s.w * k, x: s.x, y: s.y, rot: s.rot }));
}
