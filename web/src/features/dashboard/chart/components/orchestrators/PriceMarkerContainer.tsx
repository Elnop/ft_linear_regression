import { PriceMarker } from '@/features/dashboard/chart/components/presenters/PriceMarker.tsx';
import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function PriceMarkerContainer() {
  const { width } = useViewport();
  const { area } = useChart();
  const { price, at } = usePrediction();
  const overlay = usePlayground((state) => state.overlay);
  return <PriceMarker at={overlay === 'wall' ? at : null} price={price} axisY={area.y + area.height} width={width} />;
}
