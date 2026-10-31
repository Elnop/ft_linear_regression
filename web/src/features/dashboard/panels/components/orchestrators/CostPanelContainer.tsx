import { CostPanel } from '@/features/dashboard/panels/components/presenters/CostPanel.tsx';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';

export function CostPanelContainer() {
  const history = useSequence((state) => state.costHistory);
  const diverged = useSequence((state) => state.diverged);
  return <CostPanel history={history} diverged={diverged} />;
}
