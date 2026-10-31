import { WallMarker } from '@/features/dashboard/features/wall-marker/components/presenters/WallMarker.tsx';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { useScene } from '@/shared/hooks/useScene.ts';

export function WallMarkerContainer() {
  const { width, chart } = useScene();
  const { price, at } = usePrediction();
  const visible = useOverlayShown('wall');
  return <WallMarker at={visible ? at : null} price={price} axisY={chart.area.y + chart.area.height} width={width} />;
}
