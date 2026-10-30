import { useProgress } from '@/features/dashboard/hooks/useProgress.ts';
import { HeaderChips } from '@/features/dashboard/panels/components/presenters/HeaderChips.tsx';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function HeaderChipsContainer() {
  const theta0 = useSequence((state) => state.thetas?.theta0 ?? null);
  const theta1 = useSequence((state) => state.thetas?.theta1 ?? null);
  const progress = useProgress();
  return <HeaderChips theta0={theta0} theta1={theta1} progress={progress} />;
}
