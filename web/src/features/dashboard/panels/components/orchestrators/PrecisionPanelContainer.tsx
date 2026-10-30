import { PrecisionPanel } from '@/features/dashboard/panels/components/presenters/PrecisionPanel.tsx';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function PrecisionPanelContainer() {
  const metrics = useSequence((state) => state.metrics);
  return <PrecisionPanel r2={metrics?.r2 ?? null} rmse={metrics?.rmse ?? null} mae={metrics?.mae ?? null} />;
}
