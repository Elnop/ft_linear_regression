import { chartMapping, type ChartMapping } from './chart.ts';

export const SMALL = 600;
export const WIDE = 1024;
export const ASIDE_WIDTH = 340;

export const HEAD_TO_ASIDE = 92;
export const CHART_TO_FLOW = 70;
const CONTROL_BAR_HEIGHT = 72;
export const SKIP_ABOVE_BAR = CONTROL_BAR_HEIGHT + 14;

export const pagePadding = (width: number) => Math.min(44, Math.max(16, width * 0.03));
export const footerBottom = (padding: number) => Math.round(padding * 0.2);

export function chartFor(width: number, height: number): ChartMapping {
  if (width < WIDE) return chartMapping(width, height);
  return chartMapping(width - ASIDE_WIDTH - pagePadding(width) - 12, height);
}
