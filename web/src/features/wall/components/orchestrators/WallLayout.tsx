import { PaintWall } from '@/features/wall/canvas/components/orchestrators/PaintWall.tsx';
import { SprayCan } from '@/features/wall/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/wall/stickers/components/orchestrators/Stickers.tsx';
import { useSequenceRuntime } from '@/features/wall/sequence/hooks/useSequenceRuntime.ts';
import type { SequenceDependencies } from '@/features/wall/sequence/types/SequenceTypes.ts';

export function WallLayout({ sequence }: { sequence: SequenceDependencies }) {
  useSequenceRuntime(sequence);
  return (
    <>
      <PaintWall />
      <Stickers />
      <SprayCan />
    </>
  );
}
