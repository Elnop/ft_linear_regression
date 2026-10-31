import { PaintWall } from '@/features/wall/features/canvas/components/orchestrators/PaintWall.tsx';
import { SprayCan } from '@/features/wall/features/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/wall/features/stickers/components/orchestrators/Stickers.tsx';
import { useAnimationDirector } from '@/features/wall/features/animation-director/hooks/useAnimationDirector.ts';

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
