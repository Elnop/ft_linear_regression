import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { PredictPanel } from '@/features/dashboard/panels/components/presenters/PredictPanel.tsx';
import { setKm, usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';

export function PredictPanelContainer() {
  const km = usePlayground((s) => s.km);
  const { price } = usePrediction();
  return <PredictPanel value={km} onChange={setKm} price={price} />;
}
