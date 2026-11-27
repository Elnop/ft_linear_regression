import { useShallow } from 'zustand/react/shallow';
import { formatNumber } from '@/features/dashboard/shared/formatting/formatNumber.ts';
import { useRegression } from '@/features/dashboard/shared/dashboard-state/hooks/useRegression.ts';
import { useAnimationPlayback } from '@/features/dashboard/shared/dashboard-state/hooks/useAnimationPlayback.ts';

export function useProgress(): { label: string; value: string } {
  const iteration = useRegression((state) => state.iteration);
  const total = useRegression((state) => state.samples.length);
  return useAnimationPlayback(
    useShallow((state) =>
      state.phase === 'descent' || state.phase === 'interactive'
        ? { label: 'ITÉRATION', value: formatNumber(iteration) }
        : { label: 'POINTS', value: `${state.visiblePoints} / ${total}` },
    ),
  );
}
