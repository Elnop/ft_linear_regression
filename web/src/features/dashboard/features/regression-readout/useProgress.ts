import { useShallow } from 'zustand/react/shallow';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { useRegression } from '@/shared-features/regression/hooks/useRegression.ts';
import { useAnimationPlayback } from '@/shared-features/animation-playback/useAnimationPlayback.ts';

export function useProgress(): { label: string; value: string } {
  const iteration = useRegression((state) => state.iteration);
  const total = useRegression((state) => state.samples.length);
  return useAnimationPlayback(
    useShallow((state) =>
      state.phase === 'descent' || state.phase === 'interactive' ? { label: 'ITÉRATION', value: formatNumber(iteration) } : { label: 'POINTS', value: `${state.visiblePoints} / ${total}` },
    ),
  );
}
