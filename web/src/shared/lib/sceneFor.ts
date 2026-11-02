import { chartMapping } from '@/shared/lib/chartMapping.ts';
import { titleLayout } from '@/shared/lib/titleLayout.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';
import { WIDE_EM, ASIDE_WIDTH_REM } from '@/shared/configs/SceneConfig.ts';

const ASIDE_GAP_REM = 0.75;
const CHART_TO_FLOW_REM = 4.375;

export function sceneFor(width: number, height: number, rem: number): Scene {
  const wide = width >= WIDE_EM * rem;
  const padding = Math.min(2.75 * rem, Math.max(rem, width * 0.03));
  const chart = chartMapping(wide ? width - ASIDE_WIDTH_REM * rem - padding - ASIDE_GAP_REM * rem : width, height, rem);
  const title = titleLayout(width, height, padding, chart.area.y, rem);
  const dashboardTop = wide ? title.rectangle.y : chart.area.y + chart.area.height + CHART_TO_FLOW_REM * rem;
  return { width, height, rem, wide, padding, chart, title, dashboardTop };
}
