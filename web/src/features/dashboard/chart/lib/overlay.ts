import type { ChartMapping } from '@/lib/chart.ts';
import type { Rectangle } from '@/lib/paint/types.ts';

export type Overlay = 'wall' | 'chart' | 'dataset';

export function overlayRectangle({ area }: ChartMapping, width: number): Rectangle {
  const x = Math.max(8, area.x - 64);
  const y = area.y - 34;
  const right = Math.min(width - 8, area.x + area.width + 24);
  const bottom = area.y + area.height + 32;
  return { x, y, width: right - x, height: bottom - y };
}
