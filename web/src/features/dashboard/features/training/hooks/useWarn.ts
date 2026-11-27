import { useRegression } from '@/features/dashboard/shared/dashboard-state/hooks/useRegression.ts';
import { useTrainingOptions } from '@/features/dashboard/features/training/hooks/useTrainingOptions.ts';

export function useWarn(): boolean {
  const diverged = useRegression((state) => state.diverged);
  const willDiverge = useTrainingOptions((state) => state.willDiverge);
  return diverged || willDiverge;
}
