import { CostPanel } from '@/features/dashboard/features/regression-readout/components/presenters/CostPanel.tsx';
import { useRegression } from '@/states/regression/hooks/useRegression.ts';

export function CostPanelContainer() {
  const history = useRegression((state) => state.costHistory);
  const diverged = useRegression((state) => state.diverged);
  return <CostPanel history={history} diverged={diverged} />;
}
