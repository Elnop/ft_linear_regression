import { OverlayPanel } from '@/features/dashboard/shared/components/presenters/OverlayPanel.tsx';
import { PlainChart } from '@/features/dashboard/plain-chart/components/presenters/PlainChart.tsx';
import { overlayRectangle } from '@/features/dashboard/shared/lib/overlayRectangle.ts';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { lineSegment } from '@/shared/lib/lineSegment.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/lib/selectUsableThetas.ts';
import { useModelPort, useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';
import { useScene } from '@/shared/hooks/useScene.ts';

export function PlainChartContainer() {
  const { width, chart } = useScene();
  const visible = useOverlayShown('chart');
  const visiblePoints = useSequencePort((state) => state.visiblePoints);
  const samples = useModelPort((state) => state.samples);
  const thetas = useModelPort(selectUsableThetas);
  const { mileage, price, at } = usePrediction();
  const rectangle = overlayRectangle(chart, width);

  return (
    <OverlayPanel visible={visible} rectangle={rectangle}>
      <PlainChart
        chart={chart}
        width={width}
        rectangle={rectangle}
        samples={samples.slice(0, visiblePoints)}
        line={thetas ? lineSegment(thetas, chart, chart.area) : null}
        prediction={at && mileage !== null && price !== null ? { km: mileage, price, at } : null}
      />
    </OverlayPanel>
  );
}
