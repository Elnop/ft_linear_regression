import { useShallow } from 'zustand/react/shallow';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { useModelPort, useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function useProgress(): { label: string; value: string } {
  const iteration = useModelPort((state) => state.iteration);
  const total = useModelPort((state) => state.samples.length);
  return useSequencePort(
    useShallow((state) =>
      state.phase === 'descent' || state.phase === 'interactive'
        ? { label: 'PASSAGE', value: formatNumber(iteration) }
        : { label: 'POINTS', value: `${state.visiblePoints} / ${total}` },
    ),
  );
}
