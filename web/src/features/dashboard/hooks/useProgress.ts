import { useShallow } from 'zustand/react/shallow';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { formatNumber } from '@/lib/format.ts';

export function useProgress(): { label: string; value: string } {
  return useSequence(
    useShallow((s) =>
      s.phase === 'descent' || s.phase === 'interactive'
        ? { label: 'PASSAGE', value: formatNumber(s.iteration ?? s.trainOptions.iterations) }
        : { label: 'POINTS', value: `${s.visiblePoints} / ${s.totalPoints}` },
    ),
  );
}
