import { usePrediction } from '@/features/dashboard/shared/hooks/usePrediction.ts';
import { PredictPanel } from '@/features/dashboard/features/prediction/components/presenters/PredictPanel.tsx';
import { predictionActions } from '@/features/dashboard/shared/stores/predictionStore.ts';
import { useKm } from '@/features/dashboard/shared/hooks/useKm.ts';

export function PredictPanelContainer() {
  const km = useKm();
  const { invalid, outOfRange, price } = usePrediction();
  return <PredictPanel value={km} onChange={predictionActions.setKm} invalid={invalid} outOfRange={outOfRange} price={price} />;
}
