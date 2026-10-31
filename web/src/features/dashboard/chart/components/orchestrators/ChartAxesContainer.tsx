import { ChartAxes } from '@/features/dashboard/chart/components/presenters/ChartAxes.tsx';
import { useOverlayShown } from '@/features/dashboard/hooks/useOverlayShown.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function ChartAxesContainer() {
  const { width, height } = useViewport();
  const chart = useChart();
  const visible = useOverlayShown('wall');
  return <ChartAxes chart={chart} width={width} height={height} visible={visible} />;
}
