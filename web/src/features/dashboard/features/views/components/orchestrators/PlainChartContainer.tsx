import { OverlayPanel } from '@/features/dashboard/features/views/components/presenters/OverlayPanel.tsx';
import { PlainChart } from '@/features/dashboard/features/views/components/presenters/PlainChart.tsx';
import { overlayRectangle } from '@/features/dashboard/features/views/lib/overlayRectangle.ts';
import { useViewShown } from '@/features/dashboard/shared/hooks/useViewShown.ts';
import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { lineSegment } from '@/shared/lib/lineSegment.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/lib/selectUsableThetas.ts';
import { useRegression } from '@/states/regression/hooks/useRegression.ts';
import { useAnimationPlayback } from '@/states/animation-playback/useAnimationPlayback.ts';
import { useScene } from '@/shared/useScene.ts';

export function PlainChartContainer() {
  const { width, rem, chart } = useScene();
  const visible = useViewShown('chart');
  const visiblePoints = useAnimationPlayback((state) => state.visiblePoints);
  const samples = useRegression((state) => state.samples);
  const thetas = useRegression(selectUsableThetas);
  const { mileage, price, at } = usePrediction();
  const rectangle = overlayRectangle(chart, width);

  return (
    <OverlayPanel visible={visible} rectangle={rectangle}>
      <PlainChart
        chart={chart}
        width={width}
        rem={rem}
        rectangle={rectangle}
        samples={samples.slice(0, visiblePoints)}
        line={thetas ? lineSegment(thetas, chart, chart.area) : null}
        prediction={at && mileage !== null && price !== null ? { km: mileage, price, at } : null}
      />
    </OverlayPanel>
  );
}
