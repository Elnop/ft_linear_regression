import { chartMapping } from './chartMapping.ts';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';
import { WIDE, ASIDE_WIDTH } from '@/shared/configs/LayoutConfig.ts';

export const pagePadding = (width: number) => Math.min(44, Math.max(16, width * 0.03));

export function chartFor(width: number, height: number): ChartMapping {
  if (width < WIDE) return chartMapping(width, height);
  return chartMapping(width - ASIDE_WIDTH - pagePadding(width) - 12, height);
}
