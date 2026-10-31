import { useRegression } from '@/states/regression/hooks/useRegression.ts';
import { useTrainingOptions } from '@/states/regression/hooks/useTrainingOptions.ts';

export function useWarn(): boolean {
  const diverged = useRegression((state) => state.diverged);
  const willDiverge = useTrainingOptions((state) => state.willDiverge);
  return diverged || willDiverge;
}
