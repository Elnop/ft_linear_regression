import { OverlayPanel } from '@/features/dashboard/chart/components/presenters/OverlayPanel.tsx';
import { PlainChart } from '@/features/dashboard/chart/components/presenters/PlainChart.tsx';
import { overlayRectangle } from '@/features/dashboard/chart/lib/overlay.ts';
import { useOverlayShown } from '@/features/dashboard/hooks/useOverlayShown.ts';
import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { DATA } from '@/features/sequence/lib/dataset.ts';
import { lineSegment } from '@/features/sequence/lib/geometry.ts';
import { selectUsableThetas } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function PlainChartContainer() {
  const { width } = useViewport();
  const chart = useChart();
  const visible = useOverlayShown('chart');
  const visiblePoints = useSequence((state) => state.visiblePoints);
  const thetas = useSequence(selectUsableThetas);
  const { mileage, price, at } = usePrediction();
  const rectangle = overlayRectangle(chart, width);

  return (
    <OverlayPanel visible={visible} rectangle={rectangle}>
      <PlainChart
        chart={chart}
        width={width}
        rectangle={rectangle}
        samples={DATA.slice(0, visiblePoints)}
        line={thetas ? lineSegment(thetas, chart, chart.area) : null}
        prediction={at && mileage !== null && price !== null ? { km: mileage, price, at } : null}
      />
    </OverlayPanel>
  );
}
