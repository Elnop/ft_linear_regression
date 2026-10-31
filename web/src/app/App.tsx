import { Dashboard } from '@/app/layout/components/orchestrators/Dashboard.tsx';
import { PaintWall } from '@/features/wall/canvas/components/orchestrators/PaintWall.tsx';
import { SprayCan } from '@/features/wall/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/wall/stickers/components/orchestrators/Stickers.tsx';
import { useSequenceRuntime } from '@/features/wall/sequence/hooks/useSequenceRuntime.ts';

export function App() {
  useSequenceRuntime();
  return (
    <>
      <PaintWall />
      <Stickers />
      <Dashboard />
      <SprayCan />
    </>
  );
}
