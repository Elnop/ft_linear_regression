import { useProgress } from '@/features/dashboard/features/regression-readout/hooks/useProgress.ts';
import { HeaderChips } from '@/features/dashboard/features/regression-readout/components/presenters/HeaderChips.tsx';
import { useRegression } from '@/states/regression/hooks/useRegression.ts';

export function HeaderChipsContainer() {
  const theta0 = useRegression((state) => state.thetas?.theta0 ?? null);
  const theta1 = useRegression((state) => state.thetas?.theta1 ?? null);
  const progress = useProgress();
  return <HeaderChips theta0={theta0} theta1={theta1} progress={progress} />;
}
