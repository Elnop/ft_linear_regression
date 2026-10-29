import { ControlBar } from '@/features/dashboard/controls/components/presenters/ControlBar.tsx';
import { useWarn } from '@/features/dashboard/hooks/useWarn.ts';
import { setLearningRate, usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { selectIntro } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function ControlBarContainer() {
  const trainingActive = useSequence((s) => s.trainingActive);
  const intro = useSequence(selectIntro);
  const train = useSequence((s) => s.train);
  const replay = useSequence((s) => s.replay);
  const learningRate = usePlayground((s) => s.learningRate);
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
