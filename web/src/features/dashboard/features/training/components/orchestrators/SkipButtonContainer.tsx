import { SkipButton } from '@/features/dashboard/features/training/components/presenters/SkipButton.tsx';
import { selectCanSkip } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/shared-features/animation-playback/useAnimationPlayback.ts';
import { prefersReducedMotion } from '@/shared/lib/prefersReducedMotion.ts';

export function SkipButtonContainer() {
  const canSkip = useAnimationPlayback(selectCanSkip);
  const skip = useAnimationPlayback((state) => state.skip);
  return <SkipButton visible={canSkip && !prefersReducedMotion()} onSkip={skip} />;
}
