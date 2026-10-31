import { PrecisionPanel } from '@/features/dashboard/panels/components/presenters/PrecisionPanel.tsx';
import { useModelPort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function PrecisionPanelContainer() {
  const metrics = useModelPort((state) => state.metrics);
  return <PrecisionPanel r2={metrics?.r2 ?? null} rmse={metrics?.rmse ?? null} mae={metrics?.mae ?? null} />;
}
