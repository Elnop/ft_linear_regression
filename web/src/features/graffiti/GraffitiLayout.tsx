import { PaintWallContainer } from '@/features/graffiti/features/canvas/PaintWallContainer.tsx';
import { SprayCanContainer } from '@/features/graffiti/features/spray-can/components/SprayCanContainer.tsx';
import { StickersContainer } from '@/features/graffiti/features/stickers/components/StickersContainer.tsx';
import { useAnimationDirector } from '@/features/graffiti/features/animation-director/useAnimationDirector.ts';

export function GraffitiLayout() {
  useAnimationDirector();
  return (
    <>
      <PaintWallContainer />
      <StickersContainer />
      <SprayCanContainer />
    </>
  );
}
