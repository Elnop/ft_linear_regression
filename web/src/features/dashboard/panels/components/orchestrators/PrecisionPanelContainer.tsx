import { PrecisionPanel } from '@/features/dashboard/panels/components/presenters/PrecisionPanel.tsx';
import { useRegression } from '@/states/regression/hooks/useRegression.ts';

export function PrecisionPanelContainer() {
  const metrics = useRegression((state) => state.metrics);
  return <PrecisionPanel r2={metrics?.r2 ?? null} rmse={metrics?.rmse ?? null} mae={metrics?.mae ?? null} />;
}
