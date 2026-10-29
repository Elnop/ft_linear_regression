import { useEffect } from 'react';
import { useEngine } from '@/lib/paint/engineStore.ts';
import { SequenceController } from '@/features/sequence/lib/controller.ts';
import { IDLE_STATE } from '@/features/sequence/lib/state.ts';
import { IDLE_ACTIONS, sequenceStore } from '@/features/sequence/stores/sequenceStore.ts';

export function useSequenceRuntime(): void {
  const engine = useEngine();
  useEffect(() => {
    if (!engine) return;
    const controller = new SequenceController(engine, sequenceStore);
    sequenceStore.setState({
      skip: controller.skip,
      train: controller.train,
      replay: () => controller.start(),
    });
    controller.start();
    return () => {
      controller.destroy();
      sequenceStore.setState({ ...IDLE_STATE, ...IDLE_ACTIONS });
    };
  }, [engine]);
}
