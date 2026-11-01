import { WallAxes } from '@/features/dashboard/features/views/components/presenters/WallAxes.tsx';
import { useViewShown } from '@/features/dashboard/shared/hooks/useViewShown.ts';
import { useScene } from '@/shared/useScene.ts';

export function WallAxesContainer() {
  const { width, height, chart } = useScene();
  const visible = useViewShown('wall');
  return <WallAxes chart={chart} width={width} height={height} visible={visible} />;
}
