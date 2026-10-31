import { chartMapping } from './chartMapping.ts';
import { titleLayout } from './titleLayout.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';
import { WIDE, ASIDE_WIDTH } from '@/shared/configs/SceneConfig.ts';

const ASIDE_GAP = 12;
const CHART_TO_FLOW = 70;

export function sceneFor(width: number, height: number): Scene {
  const wide = width >= WIDE;
  const padding = Math.min(44, Math.max(16, width * 0.03));
  const chart = chartMapping(wide ? width - ASIDE_WIDTH - padding - ASIDE_GAP : width, height);
  const title = titleLayout(width, height, padding, chart.area.y);
  const dashboardTop = wide ? title.rectangle.y : chart.area.y + chart.area.height + CHART_TO_FLOW;
  return { width, height, wide, padding, chart, title, dashboardTop };
}
