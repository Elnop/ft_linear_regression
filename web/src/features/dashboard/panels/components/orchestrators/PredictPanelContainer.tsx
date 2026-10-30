import { usePrediction } from '@/features/dashboard/hooks/usePrediction.ts';
import { PredictPanel } from '@/features/dashboard/panels/components/presenters/PredictPanel.tsx';
import { setKm, usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';

export function PredictPanelContainer() {
  const km = usePlayground((state) => state.km);
  const { invalid, price } = usePrediction();
  return <PredictPanel value={km} onChange={setKm} invalid={invalid} price={price} />;
}
