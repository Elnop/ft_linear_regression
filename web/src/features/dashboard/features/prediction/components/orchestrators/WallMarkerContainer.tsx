import { WallMarker } from '@/features/dashboard/features/prediction/components/presenters/WallMarker.tsx';
import { useViewShown } from '@/features/dashboard/shared/hooks/useViewShown.ts';
import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { useScene } from '@/shared/useScene.ts';

export function WallMarkerContainer() {
  const { width, height, chart } = useScene();
  const { price, at } = usePrediction();
  const visible = useViewShown('wall');
  return <WallMarker at={visible ? at : null} price={price} axisY={chart.area.y + chart.area.height} width={width} height={height} />;
}
