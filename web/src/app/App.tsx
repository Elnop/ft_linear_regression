import { useWallViewModel } from '@/app/hooks/useWallViewModel.ts';
import { PaintWall } from '@/components/shared/wall/orchestrators/PaintWall.tsx';
import { WallUI } from '@/features/dashboard/layout/components/orchestrators/WallUI.tsx';
import { SprayCan } from '@/features/decor/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/decor/stickers/components/orchestrators/Stickers.tsx';
import { DocPage } from '@/features/docs/components/orchestrators/DocPage.tsx';

export function App() {
  const vm = useWallViewModel();
  return (
    <>
      <PaintWall />
      <Stickers {...vm.stickers} />
      <WallUI {...vm.wall} doc={<DocPage />} />
      <SprayCan />
    </>
  );
}
