import { SkipButton } from '@/features/dashboard/features/training/components/presenters/SkipButton.tsx';
import { selectCanSkip } from '@/features/dashboard/shared/dashboard-state/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/features/dashboard/shared/dashboard-state/hooks/useAnimationPlayback.ts';
import { prefersReducedMotion } from '@/shared/scroll/lib/prefersReducedMotion.ts';

export function SkipButtonContainer() {
  const canSkip = useAnimationPlayback(selectCanSkip);
  const skip = useAnimationPlayback((state) => state.skip);
  return <SkipButton visible={canSkip && !prefersReducedMotion()} onSkip={skip} />;
}
