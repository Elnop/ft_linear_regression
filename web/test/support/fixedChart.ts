import type { ChartMapping } from '@/shared/scene/types/ChartTypes.ts';

const area = { x: 100, y: 208, width: 820, height: 456 };
const domain = { kmMin: 0, kmMax: 250_000, priceMin: 3_000, priceMax: 9_000 };

function x(km: number): number {
  return area.x + ((km - domain.kmMin) / (domain.kmMax - domain.kmMin)) * area.width;
}

function y(price: number): number {
  return (
    area.y + (1 - (price - domain.priceMin) / (domain.priceMax - domain.priceMin)) * area.height
  );
}

export const fixedChart: ChartMapping = {
  area,
  domain,
  x,
  y,
  point: (km, price) => ({ x: x(km), y: y(price) }),
};
