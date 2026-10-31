import { PaintWall } from '@/features/wall/canvas/components/orchestrators/PaintWall.tsx';
import { SprayCan } from '@/features/wall/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/wall/stickers/components/orchestrators/Stickers.tsx';
import { useAnimationDirector } from '@/features/wall/animation-director/hooks/useAnimationDirector.ts';

export function WallLayout() {
  useAnimationDirector();
  return (
    <>
      <PaintWall />
      <Stickers />
      <SprayCan />
    </>
  );
}
