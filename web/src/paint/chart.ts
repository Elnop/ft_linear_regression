import type { Rect, Vec2 } from './types.ts';

export type ChartDomain = { kmMin: number; kmMax: number; priceMin: number; priceMax: number };

export const DEFAULT_DOMAIN: ChartDomain = { kmMin: 0, kmMax: 250_000, priceMin: 3_000, priceMax: 9_000 };

export type ChartMapping = {
  area: Rect; // plot area in wall pixels
  domain: ChartDomain;
  x(km: number): number;
  y(price: number): number;
  point(km: number, price: number): Vec2;
  km(x: number): number;
  price(y: number): number;
};

// Maps km/price to wall pixels. The plot keeps room above for the title
// and below for drips and the UI; recompute it when the wall is resized.
export function chartMapping(width: number, height: number, domain: ChartDomain = DEFAULT_DOMAIN): ChartMapping {
  const left = Math.max(40, width * 0.1);
  const right = Math.max(32, width * 0.08);
  const top = Math.max(90, height * 0.26);
  const bottom = Math.max(80, height * 0.17);
  const area = { x: left, y: top, w: Math.max(1, width - left - right), h: Math.max(1, height - top - bottom) };
  const { kmMin, kmMax, priceMin, priceMax } = domain;
  const x = (km: number) => area.x + ((km - kmMin) / (kmMax - kmMin)) * area.w;
  const y = (price: number) => area.y + (1 - (price - priceMin) / (priceMax - priceMin)) * area.h;
  return {
    area,
    domain,
    x,
    y,
    point: (km, price) => ({ x: x(km), y: y(price) }),
    km: (px) => kmMin + ((px - area.x) / area.w) * (kmMax - kmMin),
    price: (py) => priceMin + (1 - (py - area.y) / area.h) * (priceMax - priceMin),
  };
}
