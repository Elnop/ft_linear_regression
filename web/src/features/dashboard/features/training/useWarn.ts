import { useRegression } from '@/shared-features/regression/hooks/useRegression.ts';
import { useTrainingOptions } from '@/shared-features/regression/hooks/useTrainingOptions.ts';

export function useWarn(): boolean {
  const diverged = useRegression((state) => state.diverged);
  const willDiverge = useTrainingOptions((state) => state.willDiverge);
  return diverged || willDiverge;
}
