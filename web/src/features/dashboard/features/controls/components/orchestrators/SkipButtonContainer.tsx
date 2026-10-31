import { SkipButton } from '@/features/dashboard/features/controls/components/presenters/SkipButton.tsx';
import { selectCanSkip } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/states/animation-playback/hooks/useAnimationPlayback.ts';

export function SkipButtonContainer() {
  const canSkip = useAnimationPlayback(selectCanSkip);
  const skip = useAnimationPlayback((state) => state.skip);
  return <SkipButton visible={canSkip} onSkip={skip} />;
}
