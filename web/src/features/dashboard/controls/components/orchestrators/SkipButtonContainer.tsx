import { SkipButton } from '@/features/dashboard/controls/components/presenters/SkipButton.tsx';
import { selectCanSkip } from '@/features/dashboard/shared/lib/sequenceSelectors.ts';
import { useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function SkipButtonContainer() {
  const canSkip = useSequencePort(selectCanSkip);
  const skip = useSequencePort((state) => state.skip);
  return <SkipButton visible={canSkip} onSkip={skip} />;
}
