import { chartMapping, type ChartMapping } from './chart.ts';

export const WIDE = 1024;
export const ASIDE_WIDTH = 340;

export const pagePadding = (width: number) => Math.min(44, Math.max(16, width * 0.03));

export function chartFor(width: number, height: number): ChartMapping {
  if (width < WIDE) return chartMapping(width, height);
  return chartMapping(width - ASIDE_WIDTH - pagePadding(width) - 12, height);
}
