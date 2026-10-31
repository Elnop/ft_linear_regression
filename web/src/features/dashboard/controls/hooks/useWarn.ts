import { usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';
import { willDiverge } from '@/features/dashboard/controls/lib/willDiverge.ts';

export function useWarn(): boolean {
  const diverged = useSequence((state) => state.diverged);
  const learningRate = usePlayground((state) => state.learningRate);
  return diverged || willDiverge(learningRate);
}
