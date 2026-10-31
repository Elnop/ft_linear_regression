import { ControlBar } from '@/features/dashboard/controls/components/presenters/ControlBar.tsx';
import { useWarn } from '@/features/dashboard/controls/hooks/useWarn.ts';
import { setLearningRate, usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';
import { selectIntro } from '@/features/wall/sequence/lib/selectors.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';

export function ControlBarContainer() {
  const trainingActive = useSequence((state) => state.trainingActive);
  const intro = useSequence(selectIntro);
  const train = useSequence((state) => state.train);
  const replay = useSequence((state) => state.replay);
  const learningRate = usePlayground((state) => state.learningRate);
  const warn = useWarn();
  return (
    <ControlBar
      trainingActive={trainingActive}
      disabled={intro}
      onTrain={() => void train({ learningRate }).catch(() => {})}
      onReset={replay}
      learningRate={learningRate}
      onLearningRateChange={setLearningRate}
      warn={warn}
    />
  );
}
