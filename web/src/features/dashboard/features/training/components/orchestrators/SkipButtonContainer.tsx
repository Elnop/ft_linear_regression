import { SkipButton } from '@/features/dashboard/features/training/components/presenters/SkipButton.tsx';
import { selectCanSkip } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/states/animation-playback/useAnimationPlayback.ts';

export function SkipButtonContainer() {
  const canSkip = useAnimationPlayback(selectCanSkip);
  const skip = useAnimationPlayback((state) => state.skip);
  return <SkipButton visible={canSkip} onSkip={skip} />;
}
