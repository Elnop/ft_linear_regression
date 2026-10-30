import { parseMileage } from '@core/mileage.ts';
import { OverlayPanel } from '@/features/dashboard/chart/components/presenters/OverlayPanel.tsx';
import { PlainChart } from '@/features/dashboard/chart/components/presenters/PlainChart.tsx';
import { overlayRectangle } from '@/features/dashboard/chart/lib/overlay.ts';
import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { DATA } from '@/features/sequence/lib/dataset.ts';
import { lineSegment } from '@/features/sequence/lib/geometry.ts';
import { selectInterfaceVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function PlainChartContainer() {
  const { width } = useViewport();
  const chart = useChart();
  const overlay = usePlayground((state) => state.overlay);
  const km = usePlayground((state) => state.km);
  const interfaceVisible = useSequence(selectInterfaceVisible);
  const visiblePoints = useSequence((state) => state.visiblePoints);
  const thetas = useSequence((state) => state.thetas);
  const diverged = useSequence((state) => state.diverged);
  const { price, at } = usePrediction();
  const mileage = parseMileage(km);
  const rectangle = overlayRectangle(chart, width);

  return (
    <OverlayPanel visible={overlay === 'chart' && interfaceVisible} rectangle={rectangle}>
      <PlainChart
        chart={chart}
        width={width}
        rectangle={rectangle}
        samples={DATA.slice(0, visiblePoints)}
        line={thetas && !diverged ? lineSegment(thetas, chart, chart.area) : null}
        prediction={at && price !== null && mileage !== null ? { km: mileage, price, at } : null}
      />
    </OverlayPanel>
  );
}
