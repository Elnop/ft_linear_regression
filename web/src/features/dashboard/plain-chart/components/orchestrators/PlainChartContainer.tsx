import { OverlayPanel } from '@/features/dashboard/shared/components/presenters/OverlayPanel.tsx';
import { PlainChart } from '@/features/dashboard/plain-chart/components/presenters/PlainChart.tsx';
import { overlayRectangle } from '@/features/dashboard/shared/lib/overlayRectangle.ts';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { DATA } from '@/shared/configs/DatasetConfig.ts';
import { lineSegment } from '@/shared/lib/lineSegment.ts';
import { selectUsableThetas } from '@/features/wall/sequence/lib/selectors.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';
import { useChart, useViewport } from '@/shared/stores/viewportStore.ts';

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
