import { PriceMarker } from '@/features/dashboard/chart/components/presenters/PriceMarker.tsx';
import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function PriceMarkerContainer() {
  const { width } = useViewport();
  const { area } = useChart();
  const { price, at } = usePrediction();
  return <PriceMarker at={at} price={price} axisY={area.y + area.h} width={width} />;
}
