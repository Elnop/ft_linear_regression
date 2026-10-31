import { WallMarker } from '@/features/dashboard/overlays/components/presenters/WallMarker.tsx';
import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function WallMarkerContainer() {
  const { width } = useViewport();
  const { area } = useChart();
  const { price, at } = usePrediction();
  const overlay = usePlayground((state) => state.overlay);
  return <WallMarker at={overlay === 'wall' ? at : null} price={price} axisY={area.y + area.height} width={width} />;
}
