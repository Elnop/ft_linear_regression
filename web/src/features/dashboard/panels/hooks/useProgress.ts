import { useShallow } from 'zustand/react/shallow';
import { DATA } from '@/features/wall/sequence/lib/dataset.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';
import { formatNumber } from '@/features/dashboard/shared/lib/format.ts';

export function useProgress(): { label: string; value: string } {
  return useSequence(
    useShallow((state) =>
      state.phase === 'descent' || state.phase === 'interactive'
        ? { label: 'PASSAGE', value: formatNumber(state.iteration) }
        : { label: 'POINTS', value: `${state.visiblePoints} / ${DATA.length}` },
    ),
  );
}
