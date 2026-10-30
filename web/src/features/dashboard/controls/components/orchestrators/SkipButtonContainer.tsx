import { SkipButton } from '@/features/dashboard/controls/components/presenters/SkipButton.tsx';
import { selectCanSkip } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function SkipButtonContainer() {
  const canSkip = useSequence(selectCanSkip);
  const skip = useSequence((state) => state.skip);
  return <SkipButton visible={canSkip} onSkip={skip} />;
}
