import { PaintWall } from '@/components/shared/wall/orchestrators/PaintWall.tsx';
import { WallUI } from '@/features/dashboard/layout/components/orchestrators/WallUI.tsx';
import { SprayCan } from '@/features/decor/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/decor/stickers/components/orchestrators/Stickers.tsx';
import { DocPage } from '@/features/docs/components/orchestrators/DocPage.tsx';
import { useSequenceRuntime } from '@/features/sequence/hooks/useSequenceRuntime.ts';

export function App() {
  useSequenceRuntime();
  return (
    <>
      <PaintWall />
      <Stickers />
      <WallUI doc={<DocPage />} />
      <SprayCan />
    </>
  );
}
