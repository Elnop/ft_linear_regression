import { WallMarker } from '@/features/dashboard/wall-marker/components/presenters/WallMarker.tsx';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { useChart, useViewport } from '@/shared/stores/viewportStore.ts';

export function WallMarkerContainer() {
  const { width } = useViewport();
  const { area } = useChart();
  const { price, at } = usePrediction();
  const visible = useOverlayShown('wall');
  return <WallMarker at={visible ? at : null} price={price} axisY={area.y + area.height} width={width} />;
}
