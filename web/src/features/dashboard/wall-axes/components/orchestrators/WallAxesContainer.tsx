import { WallAxes } from '@/features/dashboard/wall-axes/components/presenters/WallAxes.tsx';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { useChart, useViewport } from '@/shared/stores/viewportStore.ts';

export function WallAxesContainer() {
  const { width, height } = useViewport();
  const chart = useChart();
  const visible = useOverlayShown('wall');
  return <WallAxes chart={chart} width={width} height={height} visible={visible} />;
}
