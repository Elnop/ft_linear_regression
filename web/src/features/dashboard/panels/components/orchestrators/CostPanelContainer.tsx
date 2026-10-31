import { CostPanel } from '@/features/dashboard/panels/components/presenters/CostPanel.tsx';
import { useModelPort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function CostPanelContainer() {
  const history = useModelPort((state) => state.costHistory);
  const diverged = useModelPort((state) => state.diverged);
  return <CostPanel history={history} diverged={diverged} />;
}
