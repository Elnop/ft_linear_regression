import { WallAxes } from '@/features/dashboard/wall-axes/components/presenters/WallAxes.tsx';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { useScene } from '@/shared/hooks/useScene.ts';

export function WallAxesContainer() {
  const { width, height, chart } = useScene();
  const visible = useOverlayShown('wall');
  return <WallAxes chart={chart} width={width} height={height} visible={visible} />;
}
