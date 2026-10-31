import { useModelPort, useTrainingOptionsPort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function useWarn(): boolean {
  const diverged = useModelPort((state) => state.diverged);
  const willDiverge = useTrainingOptionsPort((state) => state.willDiverge);
  return diverged || willDiverge;
}
