import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { PredictPanel } from '@/features/dashboard/features/prediction/components/presenters/PredictPanel.tsx';
import { setKm, useKm } from '@/features/dashboard/shared/stores/predictionStore.ts';

export function PredictPanelContainer() {
  const km = useKm();
  const { invalid, price } = usePrediction();
  return <PredictPanel value={km} onChange={setKm} invalid={invalid} price={price} />;
}
