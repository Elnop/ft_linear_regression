import { WallUI } from '@/app/layout/components/orchestrators/WallUI.tsx';
import { PaintWall } from '@/components/shared/wall/orchestrators/PaintWall.tsx';
import { SprayCan } from '@/features/decor/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/decor/stickers/components/orchestrators/Stickers.tsx';
import { useSequenceRuntime } from '@/features/sequence/hooks/useSequenceRuntime.ts';

export function App() {
  useSequenceRuntime();
  return (
    <>
      <PaintWall />
      <Stickers />
      <WallUI />
      <SprayCan />
    </>
  );
}
