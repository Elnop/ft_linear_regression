import { useShallow } from 'zustand/react/shallow';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { useRegression } from '@/states/regression/hooks/useRegression.ts';
import { useAnimationPlayback } from '@/states/animation-playback/useAnimationPlayback.ts';

export function useProgress(): { label: string; value: string } {
  const iteration = useRegression((state) => state.iteration);
  const total = useRegression((state) => state.samples.length);
  return useAnimationPlayback(
    useShallow((state) =>
      state.phase === 'descent' || state.phase === 'interactive'
        ? { label: 'PASSAGE', value: formatNumber(iteration) }
        : { label: 'POINTS', value: `${state.visiblePoints} / ${total}` },
    ),
  );
}
