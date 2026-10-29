import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { willDiverge } from '@/features/sequence/lib/training.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function useWarn(): boolean {
  const diverged = useSequence((s) => s.diverged);
  const learningRate = usePlayground((s) => s.learningRate);
  return diverged || willDiverge(learningRate);
}
