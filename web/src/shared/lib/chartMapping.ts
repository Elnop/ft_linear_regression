import type { ChartDomain, ChartMapping } from '@/shared/types/ChartTypes.ts';

const DEFAULT_DOMAIN: ChartDomain = { kmMin: 0, kmMax: 250_000, priceMin: 3_000, priceMax: 9_000 };

export function chartMapping(width: number, height: number, domain: ChartDomain = DEFAULT_DOMAIN): ChartMapping {
  const left = Math.max(40, width * 0.1);
  const right = Math.max(32, width * 0.08);
  const top = Math.max(90, height * 0.26);
  const bottom = Math.max(80, height * 0.17);
  const area = { x: left, y: top, width: Math.max(1, width - left - right), height: Math.max(1, height - top - bottom) };
  const { kmMin, kmMax, priceMin, priceMax } = domain;
  const x = (km: number) => area.x + ((km - kmMin) / (kmMax - kmMin)) * area.width;
  const y = (price: number) => area.y + (1 - (price - priceMin) / (priceMax - priceMin)) * area.height;
  return {
    area,
    domain,
    x,
    y,
    point: (km, price) => ({ x: x(km), y: y(price) }),
  };
}
