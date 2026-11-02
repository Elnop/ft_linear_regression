import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';

export type ChartDomain = { kmMin: number; kmMax: number; priceMin: number; priceMax: number };

export type ChartMapping = {
  area: Rectangle;
  domain: ChartDomain;
  x(km: number): number;
  y(price: number): number;
  point(km: number, price: number): Vec2;
};
