import { CostPanel } from '@/features/dashboard/panels/components/presenters/CostPanel.tsx';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function CostPanelContainer() {
  const history = useSequence((s) => s.costHistory);
  const diverged = useSequence((s) => s.diverged);
  return <CostPanel history={history} diverged={diverged} />;
}
