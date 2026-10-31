import { useEffect } from 'react';
import { useEngine } from '@/features/wall/shared/stores/engineStore.ts';
import { SequenceController } from '@/features/wall/sequence/lib/SequenceController.ts';
import { IDLE_STATE } from '@/features/wall/sequence/configs/StateConfig.ts';
import { IDLE_ACTIONS, sequenceStore } from '@/features/wall/sequence/stores/sequenceStore.ts';
import type { SequenceDependencies } from '@/features/wall/sequence/types/SequenceTypes.ts';

export function useSequenceRuntime(dependencies: SequenceDependencies): void {
  const engine = useEngine();
  useEffect(() => {
    if (!engine) return;
    const controller = new SequenceController(engine, sequenceStore, dependencies);
    sequenceStore.setState({
      skip: controller.skip,
      train: controller.train,
      replay: () => controller.start(),
    });
    controller.start();
    return () => {
      controller.destroy();
      sequenceStore.setState({ ...IDLE_STATE, ...IDLE_ACTIONS });
      dependencies.model.reset();
    };
  }, [engine, dependencies]);
}
