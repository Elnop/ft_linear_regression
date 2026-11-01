import { PaintWallContainer } from '@/features/wall/features/canvas/PaintWallContainer.tsx';
import { SprayCanContainer } from '@/features/wall/features/spray-can/components/SprayCanContainer.tsx';
import { StickersContainer } from '@/features/wall/features/stickers/components/StickersContainer.tsx';
import { useAnimationDirector } from '@/features/wall/features/animation-director/useAnimationDirector.ts';

export function WallLayout() {
  useAnimationDirector();
  return (
    <>
      <PaintWallContainer />
      <StickersContainer />
      <SprayCanContainer />
    </>
  );
}
