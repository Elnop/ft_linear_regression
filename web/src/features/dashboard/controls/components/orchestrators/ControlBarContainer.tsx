import { ControlBar } from '@/features/dashboard/controls/components/presenters/ControlBar.tsx';
import { useWarn } from '@/features/dashboard/controls/hooks/useWarn.ts';
import { selectIntro } from '@/features/dashboard/shared/lib/sequenceSelectors.ts';
import { useSequencePort, useTrainingOptionsPort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function ControlBarContainer() {
  const trainingActive = useSequencePort((state) => state.trainingActive);
  const intro = useSequencePort(selectIntro);
  const train = useSequencePort((state) => state.train);
  const replay = useSequencePort((state) => state.replay);
  const learningRate = useTrainingOptionsPort((state) => state.learningRate);
  const setLearningRate = useTrainingOptionsPort((state) => state.setLearningRate);
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
