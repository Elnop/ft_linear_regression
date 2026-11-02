import { chartTicks, formatTick } from '@/features/dashboard/features/views/lib/ticks.ts';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';

const BASELINE_SHIFT = 0.36;

type Segment = { key: number; x1: number; y1: number; x2: number; y2: number };
type Label = { key: number; text: string; x: number; y: number };

export function axisLayout(chart: ChartMapping, fontSize: number, labelGap: number) {
  const { area, domain } = chart;
  const bottom = area.y + area.height;
  const right = area.x + area.width;
  const { kmTicks, priceTicks } = chartTicks(domain);
  const priceGrid = priceTicks.map((price): Segment => ({ key: price, x1: area.x, x2: right, y1: chart.y(price), y2: chart.y(price) }));
  const kmGrid = kmTicks.map((km): Segment => ({ key: km, x1: chart.x(km), x2: chart.x(km), y1: area.y, y2: bottom }));
  const kmLabels = kmTicks.map((km): Label => ({ key: km, text: formatTick(km), x: chart.x(km), y: bottom + labelGap + fontSize }));
  const priceLabels = priceTicks.map((price): Label => ({
    key: price,
    text: formatTick(price),
    x: area.x - labelGap,
    y: chart.y(price) + fontSize * BASELINE_SHIFT,
  }));
  return { bottom, right, priceGrid, kmGrid, kmLabels, priceLabels };
}
